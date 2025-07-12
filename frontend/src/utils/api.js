const API_URL = import.meta.env.VITE_API_URL;

const BASE_URL = `${API_URL}/passwords`;

export async function verifyMasterPassword(email, masterPassword) {
  const res = await fetch(`${API_URL}/auth/auth/verify-master-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, masterPassword }),
  });
  if (!res.ok) throw new Error("Verification request failed");
    return res.json();
}


const authFetchWithRefresh = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  options.headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  let res = await fetch(url, options);

  if (res.status === 401) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
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
