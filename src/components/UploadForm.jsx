import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "video/mp4",
  "video/mpeg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const uploadFormSchema = z.object({
  title: z.string().min(3, {
    message: "Le titre doit contenir au moins 3 caractères.",
  }),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export default function UploadForm({ onSuccess }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const token = localStorage.getItem("authToken");
      return apiRequest("POST", "http://localhost:3170/api/files/upload", data, {
        Authorization: `Bearer ${token}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/user"] });
      toast({
        title: "Fichier partagé avec succès",
        description: "Votre fichier est maintenant disponible pour le téléchargement.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Une erreur s'est produite lors de l'enregistrement du fichier: ${error}`,
      });
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(`Le fichier est trop volumineux. La taille maximale est de 100MB.`);
      setFile(null);
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
      setFileError(`Type de fichier non accepté. Les formats acceptés sont: PDF, ZIP, RAR, MP3, MP4, etc.`);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileError(null);
    
    const droppedFile = e.dataTransfer.files[0];
    
    if (!droppedFile) {
      return;
    }
    
    // Validate file size
    if (droppedFile.size > MAX_FILE_SIZE) {
      setFileError(`Le fichier est trop volumineux. La taille maximale est de 100MB.`);
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(droppedFile.type)) {
      setFileError(`Type de fichier non accepté. Les formats acceptés sont: PDF, ZIP, RAR, MP3, MP4, etc.`);
      return;
    }
    
    setFile(droppedFile);
  };

  const uploadFileToServer = async () => {
    if (!file || !user) return null;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id); // Ajouter l'ID de l'utilisateur
    formData.append("title", form.getValues("title"));
    formData.append("description", form.getValues("description") || "");
    formData.append(
      "tags",
      form.getValues("tags") ? form.getValues("tags").split(",").map((tag) => tag.trim()) : []
    );

    try {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://backend-favisend.onrender.com/api/files/upload", true);

        // Ajouter le token d'authentification dans les en-têtes
        const token = localStorage.getItem("authToken");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(progress);
          }
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            setIsUploading(false);
            resolve(response); // Retourne la réponse du backend
          } else {
            setIsUploading(false);
            reject(new Error(xhr.responseText));
          }
        };

        xhr.onerror = function () {
          setIsUploading(false);
          reject(new Error("Erreur lors de l'upload."));
        };

        xhr.send(formData);
      });
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  const onSubmit = async (values) => {
    if (!file || !user) {
      setFileError("Veuillez sélectionner un fichier à uploader.");
      return;
    }

    try {
      // Upload the file to the server
      const response = await uploadFileToServer();

      if (!response) {
        throw new Error("Erreur lors de l'upload du fichier.");
      }

      toast({
        title: "Fichier uploadé avec succès",
        description: "Votre fichier est maintenant disponible pour le téléchargement.",
      });

      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      const errorMessage = error.message || "Une erreur s'est produite.";
      toast({
        variant: "destructive",
        title: "Erreur d'upload",
        description: errorMessage,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du fichier</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: Guide complet du Marketing Digital" 
                  {...field} 
                  disabled={isUploading || saveMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optionnelle)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Décrivez votre fichier..." 
                  {...field} 
                  rows={3}
                  disabled={isUploading || saveMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optionnels, séparés par des virgules)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: marketing, digital, guide" 
                  {...field} 
                  disabled={isUploading || saveMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <p className="text-sm font-medium mb-1">Fichier</p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading || saveMutation.isPending}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 ${
              fileError ? "border-red-500" : file ? "border-green-500" : "border-gray-200"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <Icons.check className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB - {file.type}
                </p>
              </div>
            ) : (
              <>
                <Icons.upload className="mx-auto text-3xl text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Cliquez pour uploader ou glissez votre fichier ici
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  PDF, MP3, MP4, ZIP, etc. (Max. 100MB)
                </p>
              </>
            )}
          </div>
          {fileError && <p className="text-sm text-red-500 mt-1">{fileError}</p>}
        </div>
        
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Upload en cours...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} max={100} />
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={!file || isUploading || saveMutation.isPending}
        >
          {isUploading ? (
            <>
              <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
              Upload en cours...
            </>
          ) : saveMutation.isPending ? (
            <>
              <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Icons.send className="mr-2 h-4 w-4" />
              Obtenir mon lien de partage
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
