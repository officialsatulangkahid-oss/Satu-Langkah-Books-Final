import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: "active" | "ongoing" | "completed";
  type: string;
}

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  ongoing: "bg-gold/10 text-gold border border-gold/20",
  completed: "bg-muted text-muted-foreground border border-border",
};

const statusLabels = {
  active: "Aktif",
  ongoing: "Berjalan",
  completed: "Selesai",
};

const ProjectCard = ({ id, title, description, icon: Icon, status, type }: ProjectCardProps) => {
  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden">
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="p-4 rounded-2xl bg-primary text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>

        {/* Type */}
        <span className="text-xs font-semibold text-gold uppercase tracking-widest">
          {type}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold text-heading mt-2 mb-4">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          {description}
        </p>

        {/* CTA */}
        <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
          <Link to={`/project/${id}`}>
            Pelajari
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;