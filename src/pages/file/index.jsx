"use client"

import { useState, useEffect, lazy, Suspense } from "react"
import { useRoute, useLocation } from "wouter"
import { useQuery } from "@tanstack/react-query"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import Loader from "@/components/Loader"

// Chargement dynamique des sous-composants
const FileDetailSection = lazy(() => import("./FileDetailSection"))
const CommentSection = lazy(() => import("./CommentSection"))

export default function File() {
  const [, params] = useRoute("/file/:id")
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const fileId = params?.id

  const [localComments, setLocalComments] = useState([])

  // Récupération des données du fichier
  const {
    data: fileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/files/detail/${fileId}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/files/detail/${fileId}`)
      return response
    },
    enabled: !!fileId,
    onSuccess: (data) => {
      setLocalComments(data.comments || [])
    },
  })

  // Gestion des erreurs de fichier
  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Ce fichier n'existe pas ou a été supprimé.",
      })
      setLocation("/explore")
    }
  }, [error, toast, setLocation])

  if (isLoading) {
    return <Loader message="Chargement du fichier..." />
  }

  if (!fileData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setLocation("/explore")}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Retour à l'exploration
          </button>

          <Suspense fallback={<Loader message="Chargement des détails du fichier..." />}>
            <FileDetailSection file={fileData} />
          </Suspense>

          <Suspense fallback={<Loader message="Chargement des commentaires..." />}>
            <CommentSection
              fileId={fileData.id}
              comments={localComments}
              setComments={setLocalComments}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
