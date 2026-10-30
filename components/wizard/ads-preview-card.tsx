import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Star, MapPin, Phone } from "lucide-react";

interface AdsPreviewCardProps {
  note: string;
  // Ajuste #6 — Datos reales para mostrar el preview tipo Google LSA
  businessName: string;     // Nombre del negocio
  service?: string;         // Servicio principal
  location?: string;        // Ciudad / locación
  phoneNumber?: string;     // Número de contacto
  bioDescription?: string;  // Una de las 6 descripciones del business BIO
  rating?: number;          // Rating (default 4.9)
  reviewsCount?: number;    // Cantidad de reseñas (display)
}

// Ajuste #6 — Layout fiel a un Google LSA real
// Estructura:
//   - Nombre del negocio
//   - Servicio
//   - Badge "Google Guaranteed"
//   - Rating con estrellas + reviews
//   - Location
//   - Number
//   - Descripción seleccionada (una de las 6 del business BIO)
export function AdsPreviewCard({
  note,
  businessName,
  service,
  location,
  phoneNumber,
  bioDescription,
  rating = 4.9,
  reviewsCount = 124
}: AdsPreviewCardProps) {
  return (
    <Card className="overflow-hidden border-indigo-200/70 bg-gradient-to-br from-indigo-50 via-cyan-50 to-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Google LSA Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Tarjeta tipo anuncio LSA real de Google */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm max-w-xs mx-auto">
          {/* Nombre del negocio */}
          <p className="text-xl font-bold text-slate-900 leading-tight">
            {businessName}
          </p>
          {/* Servicio */}
          {service ? (
            <p className="text-sm text-slate-600 mt-0.5">{service}</p>
          ) : null}

          {/* Badge Google Guaranteed */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600 fill-emerald-100" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Google Guaranteed
            </span>
          </div>

          {/* Rating + reseñas */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center" aria-label={`${rating} stars`}>
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-700 ml-0.5">
              {rating.toFixed(1)}
            </span>
            <a
              href="#reviews"
              className="text-xs text-blue-600 hover:underline ml-1"
              onClick={(e) => e.preventDefault()}
            >
              {reviewsCount} reviews
            </a>
          </div>

          {/* Location */}
          {location ? (
            <div className="flex items-center gap-1 mt-2 text-sm text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{location}</span>
            </div>
          ) : null}

          {/* Número de contacto */}
          {phoneNumber ? (
            <div className="flex items-center gap-1 mt-1 text-sm font-bold text-slate-900">
              <Phone className="h-3.5 w-3.5 text-slate-500" />
              <span>{phoneNumber}</span>
            </div>
          ) : null}

          {/* Descripción del business BIO */}
          {bioDescription ? (
            <p className="text-xs text-slate-600 mt-2 italic">
              {bioDescription}
            </p>
          ) : null}
        </div>

        {/* Nota interna del SEM team */}
        <p className="text-[11px] text-muted-foreground text-center px-2">
          {note}
        </p>
      </CardContent>
    </Card>
  );
}
