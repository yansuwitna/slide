import prisma from "./db";
import { redis } from "./redis";

const globalAny: any = global;
export const lastWriteMap: Map<string, number> = globalAny.lastWriteMap || new Map();

if (process.env.NODE_ENV !== "production") {
  globalAny.lastWriteMap = lastWriteMap;
}

export async function markStudentActive(presentationId: string, deviceId: string, studentName: string) {
  // 1. Instant update to Redis for real-time presence
  const redisKey = `pres:${presentationId}:students`;
  await redis.hset(redisKey, deviceId, JSON.stringify({ name: studentName, lastSeen: Date.now() }));
  await redis.expire(redisKey, 86400); // Auto cleanup after 24h

  // 2. Debounced update to Database for history
  const key = `${presentationId}::${deviceId}`;
  const now = Date.now();
  const lastWrite = lastWriteMap.get(key) || 0;

  if (now - lastWrite < 10000) {
    return; // Skip DB write if written recently
  }

  lastWriteMap.set(key, now);

  const existing = await prisma.participant.findFirst({
    where: { presentationId, deviceId }
  });

  if (existing) {
    await prisma.participant.update({
      where: { id: existing.id },
      data: { name: studentName, lastSeen: new Date() }
    });
  } else {
    await prisma.participant.create({
      data: { presentationId, deviceId, name: studentName, lastSeen: new Date() }
    });
  }
}

export async function getActiveStudents(presentationId: string, maxAgeMs = 15000): Promise<{ name: string, isFocused: boolean }[]> {
  const redisKey = `pres:${presentationId}:students`;
  const allStudents = await redis.hgetall(redisKey);
  
  const now = Date.now();
  const students: { name: string, isFocused: boolean }[] = [];

  for (const [deviceId, dataStr] of Object.entries(allStudents)) {
    try {
      const data = JSON.parse(dataStr as string);
      
      // Jika sudah lebih dari 1 jam tidak ada kabar sama sekali, anggap sudah keluar (jangan ditampilkan)
      if (now - data.lastSeen > 3600000) {
        // Optional: Bersihkan dari Redis sekalian
        redis.hdel(redisKey, deviceId).catch(() => {});
        continue;
      }

      const isFocused = now - data.lastSeen <= maxAgeMs;
      students.push({
        name: data.name,
        isFocused
      });
    } catch (e) {
      console.error("Error parsing student data from Redis", e);
    }
  }

  return students;
}

export async function markTeacherActive(presentationId: string) {
  // Optional: Track teacher active status in Redis
  await redis.set(`pres:${presentationId}:teacher`, "active", "EX", 30);
}

export async function markTeacherClosed(presentationId: string) {
  await redis.del(`pres:${presentationId}:teacher`);
  await redis.del(`pres:${presentationId}:students`);
}

export async function isTeacherActive(presentationId: string): Promise<boolean> {
  // Always check DB as source of truth
  const pres = await prisma.presentation.findUnique({
    where: { id: presentationId },
    select: { isActive: true }
  });
  return pres?.isActive ?? false;
}
