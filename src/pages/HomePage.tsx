import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useAuth } from '../contexts/AuthContext';
import { t } from '../i18n';
import {
  BookOpen,
  Award,
  Target,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle,
  Sparkles,
  Zap,
  BookText,
  MapPin,
  Phone,
  Mail,
  Globe,
  Quote,
  TrendingUp,
  Trophy,
  Lock,
} from 'lucide-react';
import { certifications, getCertificationStats } from '../data/certifications';
import { PaymentModal } from '../components/payment';
import { COURSE_PRICE_XOF, formatPriceXof } from '../services/payment';
import type { Certification, CertificationSlug } from '../types';

const testimonials = [
  {
    name: 'Kouakou Alexis KRA',
    certification: 'PMP®',
    photo: '/images/kra_koukou_alexis_pmp.jpg',
    text: {
      fr: "Je l'ai fait. Honnêtement, à un moment, je me sentais perdu dans la préparation du PMP®. Trop de concepts, trop de pression, et beaucoup de doutes. En découvrant Fin Mark, j'ai enfin compris comment raisonner comme l'examen l'exige. La préparation m'a donné de la méthode et de la confiance.",
      en: "I did it. Honestly, at one point I felt lost in my PMP® preparation. Too many concepts, too much pressure, and a lot of doubt. When I discovered Fin Mark, I finally understood how to think the way the exam requires. The preparation gave me method and confidence. On exam day, I knew how to approach each question.",
    },
  },
  {
    name: 'Esdras GNAMBA',
    certification: 'Project DPro® (PM4NGOs)',
    photo: '/images/esdras_project_dpro_pmd.png',
    text: {
      fr: "Je cherchais une préparation réellement adaptée au terrain. Avec Fin Mark, j'ai compris ce que la certification attendait concrètement. Les contenus sont clairs, pratiques et directement applicables dans les projets de développement. Cette certification a clairement renforcé mon efficacité professionnelle.",
      en: "I was looking for preparation truly adapted to the field. With Fin Mark, I understood what the certification concretely expected. The content is clear, practical and directly applicable in development projects. This certification clearly strengthened my professional effectiveness.",
    },
  },
  {
    name: 'Kacou Ingrid Éléonore Nanguy',
    certification: 'PMP®',
    photo: '/images/kacou_ingrid_eleonore_nanguy_pmp.jpg',
    text: {
      fr: "Je savais que le PMP® serait un vrai défi. Fin Mark m'a apporté une préparation progressive et rassurante, sans jamais me noyer dans la théorie. J'ai appris à raisonner, pas à mémoriser. Résultat : certification obtenue et beaucoup plus d'assurance dans ma pratique.",
      en: "I knew the PMP® would be a real challenge. Fin Mark gave me a progressive and reassuring preparation, without ever drowning me in theory. I learned to reason, not to memorize. Result: certification obtained and much more confidence in my practice.",
    },
  },
  // {
  //   name: 'Vosso Emmanuel',
  //   certification: 'Power BI PL-300',
  //   photo: '/images/esdras_program_dpro_foundation_examination.jpeg',
  //   text: {
  //     fr: "Je voulais aller plus loin que l'utilisation basique de Power BI. Fin Mark m'a aidé à structurer ma compréhension de la modélisation, de l'analyse et de la visualisation des données. La préparation a été décisive pour réussir l'examen. Aujourd'hui, je me sens beaucoup plus à l'aise sur les sujets data et reporting.",
  //     en: "I wanted to go beyond basic Power BI usage. Fin Mark helped me structure my understanding of data modeling, analysis and visualization. The preparation was decisive in passing the exam. Today, I feel much more comfortable with data and reporting topics.",
  //   },
  // },
  {
    name: 'Katche Acka Wilfried Adoueni',
    certification: 'PMP®',
    photo: '/images/katche_acka_wilfried_adoueni_pmp.jpg',
    text: {
      fr: "La différence s'est faite dans la manière de se préparer. Les entraînements m'ont appris à gérer le temps, la pression et la prise de décision. Le jour de l'examen, je me sentais prêt. Les acquis ont un impact direct dans mon travail aujourd'hui.",
      en: "The difference was in the way I prepared. The training taught me to manage time, pressure and decision-making. On exam day, I felt ready. The skills gained have a direct impact on my work today.",
    },
  },
  {
    name: 'Esdras GNAMBA',
    certification: 'Finance DPro® (PM4NGOs)',
    photo: '/images/esdras_finance_dpro_examination.png',
    text: {
      fr: "La gestion financière des projets est exigeante. Grâce à Fin Mark, j'ai pu renforcer mon raisonnement et mes décisions financières. La préparation est claire et orientée pratique. Une certification qui apporte une vraie valeur sur le terrain.",
      en: "Financial management of projects is demanding. Thanks to Fin Mark, I was able to strengthen my reasoning and financial decisions. The preparation is clear and practice-oriented. A certification that brings real value in the field.",
    },
  },
  {
    name: 'Diabate Ali',
    certification: 'PMP®',
    photo: '/images/diabate_ali.jpg',
    text: {
      fr: "Je ne voulais pas seulement réussir l'examen. Je voulais comprendre les standards et mieux structurer ma pratique du management de projets. Fin Mark m'a aidé à franchir ce cap. Aujourd'hui, j'applique ces principes au quotidien.",
      en: "I didn't just want to pass the exam. I wanted to understand the standards and better structure my project management practice. Fin Mark helped me reach that milestone. Today, I apply these principles daily.",
    },
  },
  // {
  //   name: 'Vosso Emmanuel',
  //   certification: 'Microsoft Office Excel',
  //   photo: '/images/rene_patrick_herve_kouadio_angoua_pmp.jpg',
  //   text: {
  //     fr: "Excel est très utilisé, mais rarement maîtrisé en profondeur. La préparation avec Fin Mark m'a permis d'améliorer mes analyses et ma productivité. Des compétences immédiatement utiles en entreprise.",
  //     en: "Excel is widely used but rarely mastered in depth. The preparation with Fin Mark helped me improve my analyses and productivity. Skills immediately useful in the workplace.",
  //   },
  // },
  {
    name: 'Kouakou Alexis KRA',
    certification: 'CISA®',
    photo: '/images/kouakou_alexis_kra.jpeg',
    text: {
      fr: "Le CISA® est un examen exigeant et coûteux. Je ne voulais pas avancer sans visibilité. Fin Mark m'a montré à quoi m'attendre et comment me préparer efficacement. Cette préparation m'a permis d'aborder l'examen avec confiance.",
      en: "The CISA® is a demanding and costly exam. I didn't want to move forward blindly. Fin Mark showed me what to expect and how to prepare effectively. This preparation allowed me to approach the exam with confidence.",
    },
  },
  {
    name: 'Esdras GNAMBA',
    certification: 'MEAL DPro® (PM4NGOs)',
    photo: '/images/esdras_meal_dpro.png',
    text: {
      fr: "Le suivi-évaluation est au cœur de tout projet de développement. Fin Mark m'a permis de structurer mes compétences en MEAL et de réussir la certification. Une préparation claire et adaptée aux exigences du secteur.",
      en: "Monitoring and evaluation is at the heart of every development project. Fin Mark helped me structure my MEAL skills and pass the certification. Clear preparation adapted to sector requirements.",
    },
  },
  {
    name: 'Esdras GNAMBA',
    certification: 'Microsoft Office Excel',
    photo: '/images/esdras_microsoft_excel.png',
    text: {
      fr: "Je voulais aller au-delà des formules de base. La préparation Fin Mark m'a permis de structurer mes analyses de données. Un gain immédiat en efficacité professionnelle.",
      en: "I wanted to go beyond basic formulas. The Fin Mark preparation helped me structure my data analysis. An immediate gain in professional efficiency.",
    },
  },
  {
    name: 'Esdras GNAMBA',
    certification: 'Microsoft Office Word',
    photo: '/images/esdras_microsof_word.png',
    text: {
      fr: "Une préparation simple et ciblée. Les exercices m'ont aidé à améliorer la qualité et la structuration de mes documents. Un impact direct dans mon travail quotidien.",
      en: "Simple, targeted preparation. The exercises helped me improve the quality and structure of my documents. A direct impact on my daily work.",
    },
  },
];

const features = [
  {
    icon: CheckCircle,
    title: 'Questions QCM',
    description: "Questions à choix unique ou multiple, accompagnées d'explications détaillées afin de renforcer la compréhension des concepts clés.",
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: Clock,
    title: 'Mode Examen',
    description: "Simulation des conditions réelles d'examen, avec gestion du temps et chronométrage, pour une préparation au plus proche de la réalité.",
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: BookText,
    title: 'Révision des terminologies',
    description: "Accès structuré aux terminologies, concepts clés et définitions essentielles, afin de consolider les fondamentaux requis à l'examen.",
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: Target,
    title: 'Suivi de progression',
    description: "Suivi continu de votre progression, permettant d'identifier les points forts et les axes d'amélioration tout au long du parcours de préparation.",
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: Award,
    title: 'Résultats détaillés',
    description: "Analyse approfondie de vos performances à travers des indicateurs et statistiques précis, pour un pilotage efficace de votre préparation.",
    color: 'from-primary-500 to-primary-600',
  },
];

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '', variant = 'default' }: { value: number; prefix?: string; suffix?: string; variant?: 'default' | 'light' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className={variant === 'light' ? 'stat-number-light' : 'stat-number'}>{prefix}{count}{suffix}</span>
  );
};


// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary-400/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paymentTarget, setPaymentTarget] = useState<Certification | null>(null);
  const { lang } = useStore();
  const { appUser } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Carousel auto-play
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Get stats from certifications data
  const stats = getCertificationStats();


  const labels = {
    hero: {
      badge: lang === 'fr' ? 'Certifications Internationales' : 'International Certifications',
      title: lang === 'fr' ? 'Préparez vos certifications avec' : 'Prepare your certifications with',
      subtitle: lang === 'fr'
        ? ''
        : '',
      browseCerts: lang === 'fr' ? 'Nos certifications' : 'Our certifications',
    },
    stats: {
      questions: 'Questions',
      certifications: 'Certifications',
      topics: lang === 'fr' ? 'Examens' : 'Exams',
    },
    features: {
      badge: '',
      title: lang === 'fr' ? 'Une plateforme de préparation aux' : 'A preparation platform for',
      titleHighlight: lang === 'fr' ? 'certifications internationales' : 'international certifications',
      subtitle: lang === 'fr'
        ? 'Fin Mark aide les candidats à comprendre les attentes réelles des examens, à se préparer avec méthode et à obtenir des certifications internationales qui renforcent leur crédibilité professionnelle.'
        : 'Fin Mark helps candidates understand real exam expectations, prepare methodically and obtain international certifications that strengthen their professional credibility.',
    },
    cta: {
      title: lang === 'fr' ? 'Prêt à' : 'Ready to',
      titleHighlight: lang === 'fr' ? 'réussir' : 'succeed',
      subtitle: lang === 'fr'
        ? 'Faites partie des candidats qui ont préparé et réussi leurs certifications avec Fin Mark'
        : 'Be one of the candidates who prepared for and passed their certifications with Fin Mark.',
    },
    footer: {
      navigation: 'Navigation',
      exams: lang === 'fr' ? 'Examens' : 'Exams',
      rights: lang === 'fr' ? 'Tous droits réservés' : 'All rights reserved',
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900 text-white">
        <FloatingParticles />

        {/* Animated gradient orbs */}
        <div className="hidden sm:block absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-primary-500/30 rounded-full blur-3xl animate-pulse-soft" />
        <div className="hidden sm:block absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-soft animation-delay-500" />

        <div className="absolute inset-0 bg-hero-pattern opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left side - Text content */}
            <div className={`flex-1 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
                <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-500/20 text-primary-300 text-xs sm:text-sm font-medium border border-primary-500/30 backdrop-blur-sm flex items-center gap-1.5 sm:gap-2">
                  {/* <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" /> */}
                  {labels.hero.badge}
                </span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold leading-tight mb-4 sm:mb-6">
                {labels.hero.title}{' '}
                <span className="text-gradient inline-block">Fin Mark</span>
              </h1>

              <div className="inline-block mb-4 sm:mb-6">
                <p className="text-lg sm:text-xl md:text-2xl text-primary-300 font-semibold text-left">
                  {labels.hero.browseCerts}
                </p>
                <div className="flex justify-center">
                  <ChevronDown className="w-6 h-6 text-primary-300 animate-bounce mt-2" />
                </div>
              </div>

              {/* Certifications badges grouped by category */}
              <div className="flex flex-col gap-2.5 mb-4 sm:mb-6">
                {([
                  { label: { fr: 'Gestion de projets', en: 'Project Management' }, icon: Target, accent: 'border-l-primary-400', iconColor: 'text-primary-400', slugs: ['pmp', 'capm', 'pm4ngos'] },
                  { label: { fr: 'Programmes, ONG & bailleurs', en: 'Programs, NGOs & Donors' }, icon: Globe, accent: 'border-l-primary-300', iconColor: 'text-primary-300', slugs: ['program-dpro', 'social-good-dpro', 'meal-dpro', 'finance-dpro'] },
                  { label: { fr: 'Audit & conformité', en: 'Audit & Compliance' }, icon: Award, accent: 'border-l-primary-400', iconColor: 'text-primary-400', slugs: ['cia-1', 'cia-2', 'cia-3', 'cisa', 'cfe'] },
                  { label: { fr: 'Data & reporting', en: 'Data & Reporting' }, icon: TrendingUp, accent: 'border-l-primary-300', iconColor: 'text-primary-300', slugs: ['pl-300', 'mos-excel'] },
                ] as const).map((group, groupIndex) => {
                  const allGroupCerts = group.slugs
                    .map(s => certifications.find(c => c.slug === s))
                    .filter(Boolean) as typeof certifications;
                  // Show all certs; locked ones get a payment trigger for logged-in users
                  const groupCerts = allGroupCerts;
                  if (groupCerts.length === 0) return null;
                  const IconComp = group.icon;
                  return (
                    <div
                      key={group.label.en}
                      className={`border-l-2 ${group.accent} pl-3 py-1.5 rounded-r-xl bg-white/[0.03] backdrop-blur-sm transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
                      style={{ transitionDelay: `${600 + groupIndex * 150}ms` }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <IconComp className={`w-3 h-3 ${group.iconColor}`} />
                        <span className="text-[11px] text-dark-400 font-semibold uppercase tracking-wider">
                          {lang === 'fr' ? group.label.fr : group.label.en}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {groupCerts.map((cert, certIndex) => {
                          const isAuthorized = !!appUser?.allowedCourses?.includes(cert.slug as CertificationSlug);
                          const dest = appUser
                            ? (isAuthorized ? `/topics?cert=${cert.slug}` : `/topics?cert=${cert.slug}&pay=1`)
                            : `/subscribe?cert=${cert.slug}`;
                          const colorMap: Record<string, string> = {
                            primary: 'bg-primary-500/15 text-primary-300 border-primary-500/25 hover:bg-primary-500/30 hover:border-primary-400/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]',
                            success: 'bg-primary-500/15 text-primary-300 border-primary-500/25 hover:bg-primary-500/30 hover:border-primary-400/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]',
                            warning: 'bg-primary-500/15 text-primary-300 border-primary-500/25 hover:bg-primary-500/30 hover:border-primary-400/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]',
                            info: 'bg-primary-500/15 text-primary-300 border-primary-500/25 hover:bg-primary-500/30 hover:border-primary-400/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]',
                          };
                          const colors = colorMap[cert.color] || colorMap.primary;
                          const displayName = cert.slug === 'pl-300' ? 'Microsoft PowerBI'
                            : cert.slug === 'mos-excel' ? 'MOS Excel'
                            : cert.name;
                          const tooltip = appUser && !isAuthorized
                            ? `${cert.fullName} — ${formatPriceXof(COURSE_PRICE_XOF)} / ${lang === 'fr' ? 'mois' : 'month'}`
                            : cert.fullName;
                          const baseClasses = `px-2.5 py-1 rounded-lg ${colors} text-xs sm:text-sm font-semibold border hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer inline-flex items-center gap-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`;
                          const style = { transitionDelay: `${750 + groupIndex * 150 + certIndex * 60}ms` };
                          if (appUser && !isAuthorized) {
                            return (
                              <button
                                key={cert.slug}
                                type="button"
                                title={tooltip}
                                onClick={() => setPaymentTarget(cert)}
                                className={baseClasses}
                                style={style}
                              >
                                <Lock className="w-3 h-3" />
                                {displayName}
                              </button>
                            );
                          }
                          return (
                            <Link
                              key={cert.slug}
                              to={dest}
                              title={tooltip}
                              className={baseClasses}
                              style={style}
                            >
                              {displayName}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-dark-300 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
                {labels.hero.subtitle}
              </p>

            </div>

            {/* Right side - Testimonials Carousel */}
            <div className={`flex-1 hidden lg:flex justify-center items-center transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95'}`}>
              <div className="relative w-full max-w-xl">
                {/* Decorative elements */}
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-500/30 rounded-full blur-2xl animate-pulse-soft" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary-500/30 rounded-full blur-2xl animate-pulse-soft animation-delay-500" />

                {/* Badge "Quelques-uns de nos certifiés" au-dessus du carousel à droite */}
                <div className="flex justify-end mr-3 mb-2 relative z-20">
                  <i className="px-4 py-1.5 rounded-full bg-[#0a1628] text-white text-sm font-semibold shadow-lg whitespace-nowrap">
                    {lang === 'fr' ? 'Quelques-uns de nos certifiés' : 'Some of our certified'}
                  </i>
                </div>

                {/* Carousel container */}
                <div className="relative overflow-hidden rounded-3xl">
                  <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {testimonials.map((item, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div className="bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                          {/* Certificate photo */}
                          <div className="relative w-full h-[440px] overflow-hidden">
                            <img
                              src={item.photo}
                              alt={`${item.name} - ${item.certification}`}
                              className="w-full h-full object-contain bg-white/5"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-5 right-5 flex items-center gap-3">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-white/20">
                                {item.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm drop-shadow-lg">{item.name}</p>
                                <p className="text-primary-300 text-xs font-medium drop-shadow-lg">{item.certification}</p>
                              </div>
                            </div>
                          </div>

                          {/* Testimonial text */}
                          <div className="px-6 py-5">
                            <Quote className="w-6 h-6 text-primary-400/50 mb-2" />
                            <p className="text-white/85 text-sm leading-relaxed line-clamp-4">
                              {item.text[lang]}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-3 top-[200px] w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-3 top-[200px] w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Carousel indicators */}
                <div className="flex justify-center gap-2 mt-5">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index
                          ? 'bg-primary-400 w-7'
                          : 'bg-white/30 hover:bg-white/50 w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative border-t border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              {/* Questions */}
              <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4 mx-auto shadow-lg">
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400" />
                </div> */}
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg">
                  <AnimatedCounter value={stats.totalQuestions} prefix="+ " variant="light" />
                </div>
                <div className="text-sm sm:text-base text-white/70 font-medium">{labels.stats.questions}</div>
              </div>

              {/* Certifications */}
              <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `150ms` }}>
                {/* <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4 mx-auto shadow-lg">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400" />
                </div> */}
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg">
                  <AnimatedCounter value={stats.totalCertifications} suffix={''} variant="light" />
                </div>
                <div className="text-sm sm:text-base text-white/70 font-medium">{labels.stats.certifications}</div>
              </div>

              {/* Topics */}
              <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `300ms` }}>
                {/* <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4 mx-auto shadow-lg">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400" />
                </div> */}
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg">
                  <AnimatedCounter value={stats.totalTopics} prefix="+ " suffix={''} variant="light" />
                </div>
                <div className="text-sm sm:text-base text-white/70 font-medium">{labels.stats.topics}</div>
              </div>

              {/* Proximité examen réel */}
              <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `450ms` }}>
                {/* <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4 mx-auto shadow-lg">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400" />
                </div> */}
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg">
                  <AnimatedCounter value={94} suffix=" %" variant="light" />
                </div>
                <div className="text-sm sm:text-base text-white/70 font-medium">{lang === 'fr' ? 'Questions très proches de l\'examen réel' : 'Questions close to real exam'}</div>
              </div>

              {/* Taux de réussite */}
              <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `600ms` }}>
                {/* <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4 mx-auto shadow-lg">
                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-primary-400" />
                </div> */}
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1 sm:mb-2 drop-shadow-lg">
                  <AnimatedCounter value={97} suffix=" %" variant="light" />
                </div>
                <div className="text-sm sm:text-base text-white/70 font-medium">{lang === 'fr' ? 'Examens réussis avec Fin Mark' : 'Exams passed with Fin Mark'}</div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-dark-50 to-white dark:from-dark-950 dark:to-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            {labels.features.badge && (
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                {labels.features.badge}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-900 dark:text-white mb-3 sm:mb-4">
              {labels.features.title} <span className="text-gradient-static">{labels.features.titleHighlight}</span>
            </h2>
            {labels.features.subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-dark-600 dark:text-dark-400 max-w-2xl mx-auto px-4">
                {labels.features.subtitle}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {features.slice(0, 3).map((feature, index) => (
              <div
                key={feature.title}
                className="relative rounded-2xl bg-white dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50 p-6 sm:p-7 animate-fade-in-up hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />
                <span className="inline-block text-xs font-bold text-dark-300 dark:text-dark-500 mb-3">0{index + 1}</span>
                <h3 className="text-base sm:text-lg font-bold text-dark-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-5 sm:gap-6 mt-5 sm:mt-6">
            {features.slice(3).map((feature, index) => (
              <div
                key={feature.title}
                className="relative rounded-2xl bg-white dark:bg-dark-800/50 border border-dark-100 dark:border-dark-700/50 p-6 sm:p-7 animate-fade-in-up hover:-translate-y-1 transition-all duration-300 overflow-hidden group w-full sm:w-[calc(33.333%-0.5rem)]"
                style={{ animationDelay: `${(index + 3) * 100}ms` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />
                <span className="inline-block text-xs font-bold text-dark-300 dark:text-dark-500 mb-3">0{index + 4}</span>
                <h3 className="text-base sm:text-lg font-bold text-dark-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800" />
        <div className="absolute inset-0 bg-hero-pattern opacity-10" />

        <div className="hidden sm:block absolute top-10 left-10 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="hidden sm:block absolute bottom-10 right-10 w-64 md:w-96 h-64 md:h-96 bg-primary-400/10 rounded-full blur-3xl animate-pulse-soft animation-delay-300" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-6">
            {labels.cta.title} <span className="text-primary-200">{labels.cta.titleHighlight}</span> ?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-primary-100 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-2">
            {labels.cta.subtitle}
          </p>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 text-dark-400 py-10 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
            {/* Navigation Links */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-white font-semibold mb-4">{labels.footer.navigation}</h4>
              <div className="flex flex-col gap-2">
                <Link to="/" className="text-xs sm:text-sm hover:text-white transition-colors">{t(lang, 'home')}</Link>
                <Link to="/dashboard" className="text-xs sm:text-sm hover:text-white transition-colors">{t(lang, 'dashboard')}</Link>
                {appUser?.role === 'admin' && (
                  <Link to="/admin" className="text-xs sm:text-sm hover:text-white transition-colors">{t(lang, 'admin')}</Link>
                )}
              </div>
            </div>

            {/* Exams */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-white font-semibold mb-4">{labels.footer.exams}</h4>
              <div className="flex flex-col gap-2">
                {certifications.map((cert) => (
                  <Link key={cert.slug} to={`/topics?cert=${cert.slug}`} className="text-xs sm:text-sm hover:text-white transition-colors">
                    {cert.slug === 'pl-300' ? 'Microsoft PowerBI' : cert.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* A propos de nous */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-white font-semibold mb-4">{lang === 'fr' ? 'A propos de nous' : 'About us'}</h4>
              <div className="flex flex-col gap-3 text-xs sm:text-sm">
                {/* Site web */}
                <a href="https://bifainstitute.netlify.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Globe className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>bifainstitute.netlify.app</span>
                </a>
                {/* Email */}
                <a href="mailto:programmes@bifainstitute.com" onClick={(e) => { e.preventDefault(); window.location.href = 'mailto:programmes@bifainstitute.com'; }} className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>programmes@bifainstitute.com</span>
                </a>
                {/* Téléphone */}
                <a href="tel:+2250700748228" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <span>+225 0700748228</span>
                </a>
                {/* Réseaux sociaux */}
                <div className="flex items-center gap-2 mt-1">
                  <a href="https://www.facebook.com/profile.php?id=100073674335341" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary-600 flex items-center justify-center transition-colors" title="Facebook">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://www.youtube.com/@bifainstitute5304" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary-600 flex items-center justify-center transition-colors" title="YouTube">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/company/76125967/admin/dashboard/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary-700 flex items-center justify-center transition-colors" title="LinkedIn">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Siège social */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-white font-semibold mb-4">{lang === 'fr' ? 'Siège social' : 'Headquarters'}</h4>
              <div className="flex flex-col gap-3 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p>Abidjan, Plateau, Immeuble Arc-en-Ciel</p>
                    {/* <p>2ᵉ étage – Angle Avenue Chardy et Boulevard Lagunaire</p> */}
                    {/* <p>01 BP 3121 Abj 01</p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          {/* <div className="border-t border-dark-800 pt-6 md:pt-8">
            <p className="text-xs sm:text-sm text-center">
              © 2025 Fin Mark. {labels.footer.rights}.
            </p>
          </div> */}
        </div>
      </footer>

      {paymentTarget && (
        <PaymentModal
          certification={paymentTarget}
          onClose={() => setPaymentTarget(null)}
        />
      )}
    </div>
  );
};
