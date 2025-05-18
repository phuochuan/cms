export const isTokenExpired = (token: string) => {
  if (!token) return true;

  const parts = token.split(".");
  if (parts.length !== 3) return true;

  try {
    const payloadBase64 = parts[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    const currentTime = Math.floor(Date.now() / 1000);

    return decodedPayload.exp < currentTime;
  } catch (e) {
    return true;
  }
};
