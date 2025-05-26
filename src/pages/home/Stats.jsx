
import { useEffect, useState, useRef } from "react";
import { Icons } from "@/assets/icons";

const testimonials = [
  {
    name: "Jean Koudjo",
    role: "Développeur Web",
    content: "Grâce à FaviSend, j'ai pu partager mes templates de sites web et générer plus de 300,000 FCFA en quelques mois. Une plateforme révolutionnaire pour les créateurs béninois!",
    rating: 5,
    avatar: "data:image/jpeg;base64,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"
  },
  {
    name: "Awa Zinsou",
    role: "Photographe",
    content: "Mes presets Lightroom et mes photos ont trouvé un public grâce à FaviSend. J'ai gagné un revenu supplémentaire tout en partageant ma passion.",
    rating: 4.5,
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN0TRkCEz7dnKr7KsTVfecsuz4IuMoq3vKPQ&s"
  },
  {
    name: "Yao Adjovi",
    role: "Artiste Graphique",
    content: "FaviSend m'a permis de vendre mes illustrations et mes packs graphiques à un public plus large. C'est une opportunité incroyable pour les créateurs au Bénin.",
    rating: 5,
    avatar: "data:image/jpeg;base64,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"
  }
];

function animateValue(start, end, duration, callback) {
  let startTimestamp = null;
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    
    callback(value);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  
  window.requestAnimationFrame(step);
}

export default function Stats() {
  const [userCount, setUserCount] = useState(0);
  const [downloadCount, setDownloadCount] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          // Start animations
          animateValue(0, 5420, 2000, setUserCount);
          animateValue(0, 24580, 2000, setDownloadCount);
          animateValue(0, 12300000, 2000, (value) => setEarnings(value));
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);

  return (
    <section id="testimonials" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold">Ils ont gagné avec FaviSend</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Nos utilisateurs partagent leurs succès. Rejoignez-les et commencez à gagner de l'argent avec vos contenus.
          </p>
        </div>
        
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-purple-50 p-6 rounded-xl text-center">
            <div className="font-heading font-bold text-4xl text-primary mb-2">
              {userCount.toLocaleString()}+
            </div>
            <p className="text-gray-600">Utilisateurs actifs</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-xl text-center">
            <div className="font-heading font-bold text-4xl text-secondary mb-2">
              {downloadCount.toLocaleString()}+
            </div>
            <p className="text-gray-600">Téléchargements</p>
          </div>
          
          <div className="bg-amber-50 p-6 rounded-xl text-center">
            <div className="font-heading font-bold text-4xl text-accent mb-2">
              {(earnings / 1000000).toFixed(1)}M+ FCFA
            </div>
            <p className="text-gray-600">Payés aux créateurs</p>
          </div>
        </div>
        
        {/* User Testimonials */}
        <div className="mt-16">
          <h3 className="text-2xl font-heading font-semibold text-center mb-8">Ce que disent nos utilisateurs</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={`Portrait de ${testimonial.name}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(testimonial.rating) ? (
                        <Icons.starFill />
                      ) : testimonial.rating % 1 !== 0 && i === Math.floor(testimonial.rating) ? (
                        <Icons.starHalfFill />
                      ) : (
                        <Icons.star className="text-gray-300" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
