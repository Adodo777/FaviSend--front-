import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "../hooks/use-toast";
import { apiRequest, queryClient } from "./queryClient";

// Création du contexte d'authentification
const AuthContext = createContext({
  user: null,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Vérifie si le token est expiré
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le payload du JWT
      const expiration = payload.exp * 1000; // Convertir en millisecondes
      return Date.now() > expiration; // Vérifier si le token est expiré
    } catch (err) {
      console.error("Erreur lors de la vérification du token :", err);
      return true; // Considérer le token comme expiré en cas d'erreur
    }
  };

  // Vérifie si l'utilisateur est connecté au chargement de l'application
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("authToken");

        if (!token || isTokenExpired(token)) {
          setUser(null);
          localStorage.removeItem("authToken"); // Supprimez le token s'il est expiré ou absent
          return;
        }

        // Vérifie l'utilisateur via le backend
        const userData = await apiRequest("GET", "/api/auth/user", null, {
            Authorization: `Bearer ${token}`,
        });

        setUser(userData);
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification :", err);
        setUser(null);
        setError(err);
        localStorage.removeItem("authToken"); // Supprimez le token en cas d'erreur
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      // Envoie les données de connexion au backend
      const { token, user } = await apiRequest("POST", "/api/auth/login", { email, password });

      // Stocke le token et les données utilisateur
      localStorage.setItem("authToken", token);
      setUser(user);

      // Invalide les requêtes liées à l'utilisateur
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Affiche un toast de succès
      toast({
        title: "Connecté avec succès",
        description: `Bienvenue, ${user.displayName || user.username}!`,
      });
    } catch (err) {
      console.error("Erreur de connexion:", err);

      // Gère les erreurs
      setError(err);
      toast({
        variant: "destructive",
        title: "Échec de la connexion",
        description: err.message || "Vérifiez vos identifiants et réessayez.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (username, email, password) => {
    try {
      setIsLoading(true);

      // Envoie les données d'inscription au backend
      const { token, user } = await apiRequest("POST", "/api/auth/register", {
        username,
        email,
        password,
      });

      // Stocke le token et les données utilisateur
      localStorage.setItem("authToken", token);
      setUser(user);

      // Invalide les requêtes liées à l'utilisateur
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Affiche un toast de succès
      toast({
        title: "Compte créé avec succès",
        description: `Bienvenue, ${user.displayName || user.username}!`,
      });
    } catch (err) {
      console.error("Erreur d'inscription:", err);

      // Gère les erreurs
      setError(err);
      toast({
        variant: "destructive",
        title: "Échec de l'inscription",
        description: err.message || "Cet identifiant ou email est peut-être déjà utilisé.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      setIsLoading(true);

      // Appelle le backend pour la déconnexion
      await apiRequest("POST", "/api/auth/logout");

      // Supprime le token et réinitialise l'utilisateur
      localStorage.removeItem("authToken");
      setUser(null);

      // Invalide les requêtes liées à l'utilisateur
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      // Affiche un toast de succès
      toast({
        title: "Déconnecté avec succès",
        description: "À bientôt!",
      });
    } catch (err) {
      console.error("Erreur de déconnexion:", err);

      // Gère les erreurs
      toast({
        variant: "destructive",
        title: "Échec de la déconnexion",
        description: "Une erreur s'est produite lors de la déconnexion.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Valeurs fournies par le contexte
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
