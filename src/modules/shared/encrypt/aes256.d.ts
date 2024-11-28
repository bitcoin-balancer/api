declare module 'aes256' {
  function encrypt(secret: string, data: string): string;
  function decrypt(secret: string, encryptedData: string): string;
}
