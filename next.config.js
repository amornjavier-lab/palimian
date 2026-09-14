import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    // ใส่ชื่อแพ็กเกจภายนอกที่สงสัยว่าใช้ eval หรือไลบรารีฐานข้อมูล/CMS ที่นี่ เช่น
    // "sqlite", หรือแพ็กเกจอื่นๆ ที่เกี่ยวข้อง
  ],
};

export default nextConfig;