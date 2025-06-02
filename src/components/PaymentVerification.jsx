
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Download, Mail } from "lucide-react"
import { apiRequest } from "@/lib/queryClient"
import { Link } from "wouter"


export default function PaymentVerification({ paymentId }) {
  console.log("PaymentVerification component rendered with paymentId:", paymentId)

  const {
    data: paymentData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/purchase/verify/${paymentId}`],
    queryFn: async () => {
      console.log("Sending verification request for paymentId:", paymentId)
      const response = await apiRequest("GET", `/api/purchase/verify/${paymentId}`)
      console.log("Payment verification response:", response)
      return response
    },
    enabled: !!paymentId,
    retry: 3,
    retryDelay: 2000,
  })

  const handleDownload = (downloadUrl) => {
    console.log("Initiating download:", downloadUrl)
    window.open(downloadUrl, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="h-6 w-6 text-blue-600" />
              Vérification du paiement...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600">
              Nous vérifions le statut de votre paiement. Veuillez patienter.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Paiement réussi
  if (paymentData && paymentData.status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Paiement réussi !</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                <strong>Email de confirmation envoyé à :</strong><br />
                {paymentData.buyerEmail}
              </AlertDescription>
            </Alert>

            {paymentData.downloadUrl && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-700 mb-4">
                    Votre fichier est prêt à être téléchargé !
                  </p>
                  <Button 
                    onClick={() => handleDownload(paymentData.downloadUrl)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Télécharger le fichier
                  </Button>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Mail className="h-4 w-4" />
                  <AlertDescription className="text-blue-800">
                    Le lien de téléchargement a également été envoyé par email pour votre convenance.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="text-center pt-4">
              <Link href="/explore">
                <Button variant="outline">
                  Continuer l'exploration
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Paiement en cours
  if (error?.status === 404 || (paymentData && paymentData.status === 'pending')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Clock className="h-16 w-16 text-yellow-600" />
            </div>
            <CardTitle className="text-yellow-800">Achat en cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-700">
              Votre paiement est en cours de traitement. Cela peut prendre quelques minutes.
            </p>
            
            <Alert className="border-yellow-200 bg-yellow-50">
              <Mail className="h-4 w-4" />
              <AlertDescription className="text-yellow-800">
                Un email de confirmation vous sera envoyé dès que votre achat sera finalisé.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                className="w-full"
              >
                Vérifier à nouveau
              </Button>
              
              <Link href="/explore">
                <Button variant="ghost" className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Échec du paiement
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Échec d'achat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-700">
            Nous n'avons pas pu traiter votre paiement. Veuillez réessayer.
          </p>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error?.message || "Une erreur est survenue lors du traitement de votre paiement."}
            </AlertDescription>
          </Alert>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="w-full"
            >
              Réessayer la vérification
            </Button>
            
            <Link href="/explore">
              <Button variant="ghost" className="w-full">
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
