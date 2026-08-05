import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Users, Play } from "lucide-react";
import CheckoutModal from "@/components/checkout/CheckoutModal";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: "Pemula" | "Menengah" | "Lanjutan";
  duration: string;
  lessons: number;
  students: number;
  price: string;
  priceAmount?: number;
  image?: string;
}

const levelColors = {
  "Pemula": "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  "Menengah": "bg-gold/10 text-gold border border-gold/20",
  "Lanjutan": "bg-primary/10 text-primary border border-primary/20",
};

const CourseCard = ({ 
  id, 
  title, 
  description, 
  level, 
  duration, 
  lessons, 
  students,
  price,
  priceAmount = 0
}: CourseCardProps) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <>
      <div className="group bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden">
        {/* Image Placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground)/0.03)_1px,transparent_1px)] bg-[size:2rem_2rem]" />
          <div className="relative p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-500">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-7">
          {/* Level Badge */}
          <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold mb-4 ${levelColors[level]}`}>
            {level}
          </span>

          {/* Title */}
          <h3 className="text-xl font-bold text-heading mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-2">
            {description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-5 text-xs text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{lessons} Materi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{students}</span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div>
              <span className="text-xs text-muted-foreground">Mulai dari</span>
              <p className="text-xl font-bold text-primary">{price}</p>
            </div>
            <Button 
              variant="gold" 
              size="sm"
              onClick={() => setIsCheckoutOpen(true)}
            >
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={{
          id,
          name: title,
          price: priceAmount,
          type: "ecourse",
        }}
      />
    </>
  );
};

export default CourseCard;