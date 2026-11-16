import {
  Bookmark,
  Briefcase,
  Calendar,
  CalendarCheck,
  Camera,
  ClipboardList,
  Contact,
  Facebook,
  FileDown,
  FileText,
  Film,
  Globe,
  Instagram,
  LayoutTemplate,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Music2,
  Phone,
  QrCode,
  Radio,
  Send,
  Share2,
  ShoppingBag,
  Star,
  Store,
  Tv,
  Users,
  Video,
  Wifi,
  Youtube,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = 'w-5 h-5' }: CategoryIconProps) {
  switch (name) {
    case 'Globe':
      return <Globe className={className} />;
    case 'Wifi':
      return <Wifi className={className} />;
    case 'MessageCircle':
      return <MessageCircle className={className} />;
    case 'Contact':
      return <Contact className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Mail':
      return <Mail className={className} />;
    case 'Phone':
      return <Phone className={className} />;
    case 'MessageSquare':
      return <MessageSquare className={className} />;
    case 'MapPin':
      return <MapPin className={className} />;
    case 'Instagram':
      return <Instagram className={className} />;
    case 'Youtube':
      return <Youtube className={className} />;
    case 'Facebook':
      return <Facebook className={className} />;
    case 'Linkedin':
      return <Linkedin className={className} />;
    case 'Music2':
      return <Music2 className={className} />;
    case 'Calendar':
      return <Calendar className={className} />;
    case 'FileDown':
      return <FileDown className={className} />;
    case 'Video':
      return <Video className={className} />;
    case 'Film':
      return <Film className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'ClipboardList':
      return <ClipboardList className={className} />;
    case 'CalendarCheck':
      return <CalendarCheck className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'LayoutTemplate':
      return <LayoutTemplate className={className} />;
    case 'Link2':
      return <Link2 className={className} />;
    case 'Share2':
      return <Share2 className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'Send':
      return <Send className={className} />;
    case 'Radio':
      return <Radio className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Bookmark':
      return <Bookmark className={className} />;
    default:
      return <QrCode className={className} />;
  }
}
