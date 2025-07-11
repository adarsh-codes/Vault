const BASE_URL = "http://localhost:8000/passwords";

const authFetchWithRefresh = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  options.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  let res = await fetch(url, options);

  if (res.status === 401) {
    const refreshRes = await fetch("http://localhost:8000/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      localStorage.setItem("accessToken", data.access_token);

      options.headers.Authorization = `Bearer ${data.access_token}`;
      res = await fetch(url, options);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  return res;
};

export const getPasswords = async () => {
  const res = await authFetchWithRefresh(`${BASE_URL}/get-passwords`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch passwords");
  return await res.json();
};

export const addPassword = async (data) => {
  const res = await authFetchWithRefresh(`${BASE_URL}/add-password`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add password");
  return await res.json();
};

export const updatePassword = async (id, data) => {
  const res = await authFetchWithRefresh(`${BASE_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update password");
  return await res.json();
};

export const deletePassword = async (id) => {
  const res = await authFetchWithRefresh(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete password");
  return await res.json();
};
