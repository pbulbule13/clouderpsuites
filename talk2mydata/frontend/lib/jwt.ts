export interface GoogleJwtPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  exp: number;
  iat: number;
  aud: string;
  iss: string;
}

export function jwtDecode(token: string): GoogleJwtPayload {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}
