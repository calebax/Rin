// src/utils/url.ts
import normalize from "normalize-url";

/**
 * 检查字符串是否为有效 URL
 * @param url 要检查的字符串
 * @returns 如果是有效 URL 则返回 true，否则返回 false
 */
export const isValidURL = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed || trimmed.includes(" ")) return false;

  try {
    new URL(input);
    return true;
  } catch {
    // 如果没有协议，但含点且没有空格 → 可以补 https
    if (trimmed.includes(".") && !trimmed.includes(" ")) {
      return true;
    }
    return false;
  }
};

/**
 * 将用户输入的地址或搜索词规范化为完整 URL
 * @param raw 用户输入的字符串
 * @returns 完整 URL
 */
export const normalizeURL = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    console.log("normalize:", trimmed, normalize(trimmed));
    return normalize(trimmed);
  } catch (e) {
    console.warn("Invalid URL:", trimmed, e);
    return null;
  }
};
