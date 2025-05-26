import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

// Configuration globale d'Axios
const axiosInstance = axios.create({
  baseURL: "https://backend-favisend.onrender.com", // Remplacez par l'URL de base de votre API
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fonction pour vérifier si la réponse HTTP est correcte
async function throwIfResNotOk(error, url, method) {
  if (error.response) {
    const { status, data } = error.response;
    const message = data.message || error.message || "Une erreur s'est produite";
    throw new Error(`${message}`);
  } else {
    throw new Error(`${method} ${url} failed: ${error.message}`);
  }
}

// Fonction générique pour effectuer des requêtes HTTP
export async function apiRequest(method, url, data = null, headers = {}) {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      headers,
    });
    return response.data; // Retourne directement les données JSON
  } catch (error) {
    await throwIfResNotOk(error, url, method); // Gère les erreurs
  }
}

// Fonction par défaut pour les requêtes React Query
export const getQueryFn = ({ on401 = "throw" }) => async ({ queryKey }) => {
  try {
    const response = await axiosInstance.get(queryKey[0]);
    return response.data; // Retourne directement les données JSON
  } catch (error) {
    if (on401 === "returnNull" && error.response?.status === 401) {
      return null; // Retourne null si l'option on401 est configurée ainsi
    }
    await throwIfResNotOk(error, queryKey[0], "GET"); // Gère les erreurs
  }
};

// Configuration du client React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }), // Fonction par défaut pour les requêtes
      refetchInterval: false, // Pas de rechargement périodique
      refetchOnWindowFocus: false, // Pas de rechargement au focus de la fenêtre
      staleTime: Infinity, // Les données ne deviennent jamais obsolètes
      retry: false, // Pas de nouvelle tentative en cas d'échec
    },
    mutations: {
      retry: false, // Pas de nouvelle tentative pour les mutations
    },
  },
});
