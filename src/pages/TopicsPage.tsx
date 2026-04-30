import { Link, useSearchParams, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveExamResult } from '../services/firestore';
import type { CertificationSlug } from '../types';
import { Shield, Search, Scale, DollarSign, ChevronRight, ChevronLeft, BookOpen, Briefcase, Target, Award, FileText, Info, BookText, ClipboardList, Clock, Zap, RotateCcw, CheckCircle, XCircle, Trophy, Flame, Calculator, AlertTriangle, CheckSquare, FolderCheck, Users, UserCheck, TrendingUp, MessageCircle, Play, ArrowLeft, ArrowRight, Timer, Coffee, Monitor, Heart, Layers, Wallet, LineChart, BarChart, Download, Lock } from 'lucide-react';
import { categories } from '../data/questions';
import { certifications } from '../data/certifications';
import { allAgileTerminologies } from '../data/pmp_terminologie_agile';
import { allHybridTerminologies } from '../data/pmp_terminologie_hibrdyde';
import { powerBiGlossary } from '../data/pl_300_terminologie';
import { formulas } from '../data/formules_pmp';
import { formulas as pl300Formulas } from '../data/formules_pl300';
import { pmpDomains, getQuestionsByDomainSlug, type PMPDomain } from '../data/pmp_domains';
import { pmpMiniExams, totalMiniExamQuestions, type MiniExam, type NormalizedQuestion } from '../data/pmp_mini_exams';
import { ciaPart1MiniExams, totalCiaPart1MiniExamQuestions } from '../data/cia_part1_mini_exams';
import { ciaPart2MiniExams, totalCiaPart2MiniExamQuestions } from '../data/cia_part2_mini_exams';
import { ciaPart3MiniExams, totalCiaPart3MiniExamQuestions } from '../data/cia_part3_mini_exams';
import { pmpFullExams, totalFullExamQuestions, type FullExam, type NormalizedFullQuestion } from '../data/pmp_full_exams';
import { ciaPart1FullExams, ciaPart2FullExams, ciaPart3FullExams, totalCiaPart1FullExamQuestions, totalCiaPart2FullExamQuestions, totalCiaPart3FullExamQuestions } from '../data/cia_full_exams';
import { cfeFullExams, totalCfeFullExamQuestions } from '../data/cfe_full_exams';
import { pl300FullExams, totalPl300FullExamQuestions } from '../data/pl300_full_exams';
import { cisaMiniExams, totalCisaMiniExamQuestions } from '../data/cisa_mini_exams';
import { cisaFullExams, totalCisaFullExamQuestions } from '../data/cisa_full_exams';
import { fmdproMiniExams, totalFmdproMiniExamQuestions } from '../data/fmdpro_mini_exams';
import { pdproMiniExams, totalPdproMiniExamQuestions } from '../data/pdpro_mini_exams';
import { socialgproMiniExams, totalSocialgproMiniExamQuestions } from '../data/socialgpro_mini_exams';
import { mealdproMiniExams, totalMealdproMiniExamQuestions } from '../data/mealdpro_mini_exams';
import { pgdproMiniExams, totalPgdproMiniExamQuestions } from '../data/pgdpro_mini_exams';
import { pl300MiniExams, totalPl300MiniExamQuestions } from '../data/pl300_mini_exams';
import { fmdproFullExams, totalFmdproFullExamQuestions } from '../data/fmdpro_full_exams';
import { pdproFullExams, totalPdproFullExamQuestions } from '../data/pdpro_full_exams';
import { socialgproFullExams, totalSocialgproFullExamQuestions } from '../data/socialgpro_full_exams';
import { mealdproFullExams, totalMealdproFullExamQuestions } from '../data/mealdpro_full_exams';
import { pgdproFullExams, totalPgdproFullExamQuestions } from '../data/pgdpro_full_exams';
import { useStore } from '../store/useStore';
import type { Category, Certification } from '../types';
import { PaymentModal } from '../components/payment';
import { COURSE_PRICE_XOF, formatPriceXof } from '../services/payment';
import type { Lang } from '../i18n';

// Domain icon map
const domainIconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  CheckSquare,
  FolderCheck,
  Users,
  UserCheck,
  TrendingUp,
  MessageCircle,
};

const iconMap: Record<string, React.ElementType> = {
  Shield,
  Search,
  Scale,
  DollarSign,
  Briefcase,
  Target,
  Award,
  BookOpen,
  FileText,
  Monitor,
  Heart,
  Layers,
  Wallet,
  LineChart,
  BarChart,
  Users,
};

const colorMap: Record<string, { gradient: string; badge: string }> = {
  primary: {
    gradient: 'from-primary-500 to-primary-700',
    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
  },
  success: {
    gradient: 'from-primary-500 to-primary-700',
    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
  },
  warning: {
    gradient: 'from-primary-400 to-primary-600',
    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
  },
  info: {
    gradient: 'from-primary-600 to-primary-800',
    badge: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300'
  },
};

// Course PDF data per certification
const certificationCourses: Record<string, { category: string; files: { name: string; url: string }[] }[]> = {
  cfe: [
    {
      category: 'Fraud Prevention and Deterrence',
      files: [
        { name: 'Corporate Governance', url: '/cours/Fraud Prevention and Deterrence_Corporate.pdf' },
        { name: 'Criminal Behavior', url: '/cours/Fraud Prevention and Deterrence_Criminal Behavior.pdf' },
        { name: 'Fraud Risk Management', url: '/cours/Fraud Prevention and Deterrence_Fraude risk Mangt.pdf' },
        { name: 'Fraud Prevention Program', url: '/cours/Fraud Prevention and Deterrence_Program.pdf' },
      ],
    },
    {
      category: 'Investigation',
      files: [
        { name: 'Data Analysis', url: '/cours/Investigation_Data Analysis.pdf' },
        { name: 'Interview Techniques', url: '/cours/Investigation_Interview.pdf' },
        { name: 'Planning and Conducting', url: '/cours/Investigation_Planning and Conducting.pdf' },
        { name: 'Source Information', url: '/cours/Investigation_source information.pdf' },
      ],
    },
    {
      category: 'Law',
      files: [
        { name: 'Civil Justice Systems', url: '/cours/CIVIL JUSTICE SYSTEMES.pdf' },
        { name: 'Criminal Justice Systems', url: '/cours/CRIMINAL JUSTICE SYSTEMS.pdf' },
      ],
    },
  ],
  'cia-1': [
    {
      category: 'CIA Part 1 - Cours',
      files: [
        { name: 'Unité d\'étude 1', url: '/cours/cia1/CIA Part 1 - Unité d_étude 1.pdf' },
        { name: 'Unité d\'étude 2', url: '/cours/cia1/CIA Part 1 - Unité d_étude 2.pdf' },
        { name: 'Unité d\'étude 3', url: '/cours/cia1/CIA Part 1 - Unité d_étude 3.pdf' },
        { name: 'Unité d\'étude 4', url: '/cours/cia1/CIA Part 1 - Unité d_étude 4.pdf' },
        { name: 'Unité d\'étude 5', url: '/cours/cia1/CIA Part 1 - Unité d_étude 5.pdf' },
        { name: 'Unité d\'étude 6', url: '/cours/cia1/CIA Part 1 - Unité d_étude 6.pdf' },
        { name: 'Unité d\'étude 7', url: '/cours/cia1/CIA Part 1 - Unité d_étude 7.pdf' },
      ],
    },
  ],
  'cia-2': [
    {
      category: 'CIA Part 2 - Cours',
      files: [
        { name: 'Unité d\'étude 1', url: '/cours/cia2/CIA Part 2 - Unité d_étude 1.pdf' },
        { name: 'Unité d\'étude 2', url: '/cours/cia2/CIA Part 2 - Unité d_étude 2.pdf' },
        { name: 'Unité d\'étude 3', url: '/cours/cia2/CIA Part 2 - Unité d_étude 3.pdf' },
        { name: 'Unité d\'étude 4', url: '/cours/cia2/CIA Part 2 - Unité d_étude 4.pdf' },
        { name: 'Unité d\'étude 5', url: '/cours/cia2/CIA Part 2 - Unité d_étude 5.pdf' },
        { name: 'Unité d\'étude 6', url: '/cours/cia2/CIA Part 2 - Unité d_étude 6.pdf' },
        { name: 'Unité d\'étude 7', url: '/cours/cia2/CIA Part 2 - Unité d_étude 7.pdf' },
        { name: 'Unité d\'étude 8', url: '/cours/cia2/CIA Part 2 - Unité d_étude 8.pdf' },
        { name: 'Unité d\'étude 9', url: '/cours/cia2/CIA Part 2 - Unité d_étude 9.pdf' },
      ],
    },
  ],
  'cia-3': [
    {
      category: 'CIA Part 3 - Cours',
      files: [
        { name: 'Unité d\'étude 1', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 1.pdf' },
        { name: 'Unité d\'étude 2', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 02.pdf' },
        { name: 'Unité d\'étude 3', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 03.pdf' },
        { name: 'Unité d\'étude 4', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 04.pdf' },
        { name: 'Unité d\'étude 5', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 05.pdf' },
        { name: 'Unité d\'étude 6', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 06.pdf' },
        { name: 'Unité d\'étude 7', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 07.pdf' },
        { name: 'Unité d\'étude 8', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 08.pdf' },
        { name: 'Unité d\'étude 9', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 09.pdf' },
        { name: 'Unité d\'étude 10', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 10.pdf' },
        { name: 'Unité d\'étude 11', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 11.pdf' },
        { name: 'Unité d\'étude 12', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 12.pdf' },
        { name: 'Unité d\'étude 13', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 13.pdf' },
        { name: 'Unité d\'étude 14', url: '/cours/cia3/CIA_CIA3_Cours Unite d etude 14.pdf' },
      ],
    },
  ],
};

// Guide PDF data per certification
const certificationGuides: Record<string, { name: string; url: string }[]> = {
  'cia-1': [
    { name: 'Assessing the Adequacy of Risk Management Using ISO 31000 (French)', url: '/guides/cia1/Assessing the Adequacy of Risk Management Using ISO 31000 French.pdf' },
    { name: 'Code of Ethics (French)', url: '/guides/cia1/Code-of-Ethics-French.pdf' },
    { name: 'Guide PAAQ', url: '/guides/cia1/Guide-PAAQ.PDF' },
    { name: 'IIA Global Internal Audit Standards - Public Comment Draft (French)', url: '/guides/cia1/iia-global-internal-audit-standards-public-comment-draft-french.pdf' },
    { name: 'IPPF Standards 2017 (French)', url: '/guides/cia1/IPPF-Standards-2017-French.pdf' },
    { name: 'Les lignes directrices de mise en œuvre 2017', url: '/guides/cia1/LES LIGNES DIRECTRICES DE MISE EN OEUVRE 2017.pdf' },
    { name: 'Developing a Risk-Based Internal Audit Plan', url: '/guides/cia1/pg-developing-a-risk-based-internal-audit-plan.pdf' },
  ],
  'cia-2': [],
  'cia-3': [
    { name: 'Certification Candidate Handbook (French)', url: '/guides/cia3/Certification Candidate Handbook French.pdf' },
    { name: 'GTAG 1 - Les contrôles des systèmes de l\'information (2e éd.)', url: '/guides/cia3/GTAG 1 - Les contrôles des systèmes de l_information_2e éd.pdf' },
    { name: 'GTAG 10 - Gestion de la continuité d\'activité', url: '/guides/cia3/GTAG 10 - Gestion de la continuité d_activité.pdf' },
    { name: 'GTAG 11 - Élaboration d\'un plan d\'audit des SI', url: '/guides/cia3/GTAG 11– Élaboration d_un plan d_audit des SI.pdf' },
    { name: 'GTAG 12 - Audit des projets SI', url: '/guides/cia3/GTAG 12 – Audit des projets SI.pdf' },
    { name: 'GTAG 3 - Audit continu', url: '/guides/cia3/GTAG 3 - Audit continu _répercussions sur l_assurance_ le piotage et l_évaluation des risques.pdf' },
    { name: 'GTAG 4 - Management de l\'audit des systèmes d\'information', url: '/guides/cia3/GTAG 4 - Management de l_audit des systèmes d_information.pdf' },
    { name: 'GTAG 8 - Audit des contrôles applicatifs', url: '/guides/cia3/GTAG 8 - Audit des contrôles applicatifs.pdf' },
    { name: 'GTAG 9 - Gestion des identités et des accès', url: '/guides/cia3/GTAG 9 - Gestion des identités et des accès.pdf' },
    { name: 'GTAG - Audit des appareils intelligents', url: '/guides/cia3/GTAG-Audit-des-appareils-intelligents.pdf' },
    { name: 'GTAG - Évaluer le risque de cybersécurité', url: '/guides/cia3/GTAG-Evaluer-le-risque-de-cybersecurite-vf_1.pdf' },
  ],
};

// Flashcard Component
const Flashcard = ({
  term,
  english,
  description,
  isFlipped,
  onFlip
}: {
  term: string;
  english: string;
  description: string;
  isFlipped: boolean;
  onFlip: () => void;
}) => {
  return (
    <div
      className="relative w-full h-64 cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front - Term */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 p-6 flex flex-col items-center justify-center text-white shadow-xl">
          <p className="text-2xl font-bold text-center mb-2">{term}</p>
          <p className="text-lg text-primary-100 italic">({english})</p>
          <p className="text-sm text-primary-200 mt-4">Cliquez pour voir la définition</p>
        </div>

        {/* Back - Definition */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 p-6 flex flex-col items-center justify-center text-white shadow-xl border border-primary-500/30">
          <p className="text-sm text-primary-400 font-semibold mb-2">{term}</p>
          <p className="text-base text-center leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Formula Flashcard Component
const FormulaFlashcard = ({
  abbreviation,
  name,
  formula,
  definition,
  usage,
  interpretation,
  isFlipped,
  onFlip
}: {
  abbreviation: string;
  name: string;
  formula?: string;
  definition: string;
  usage: string;
  interpretation?: string;
  isFlipped: boolean;
  onFlip: () => void;
}) => {
  return (
    <div
      className="relative w-full h-80 cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front - Abbreviation & Formula */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 flex flex-col items-center justify-center text-white shadow-xl">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <Calculator className="w-8 h-8" />
          </div>
          <p className="text-4xl font-bold text-center mb-2">{abbreviation}</p>
          <p className="text-base text-primary-100 text-center mb-4">{name}</p>
          {formula && (
            <div className="px-4 py-2 bg-white/10 rounded-lg">
              <p className="text-lg font-mono font-semibold">{formula}</p>
            </div>
          )}
          <p className="text-sm text-primary-200 mt-4">Cliquez pour voir les détails</p>
        </div>

        {/* Back - Definition & Details */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-900 p-6 flex flex-col text-white shadow-xl border border-primary-600/30 overflow-y-auto">
          <p className="text-lg text-primary-400 font-bold mb-1">{abbreviation}</p>
          <p className="text-sm text-primary-300 mb-4">{name}</p>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-primary-400 font-semibold mb-1">Définition</p>
              <p className="text-dark-200">{definition}</p>
            </div>
            <div>
              <p className="text-primary-400 font-semibold mb-1">Utilisation</p>
              <p className="text-dark-200">{usage}</p>
            </div>
            {interpretation && (
              <div>
                <p className="text-primary-400 font-semibold mb-1">Interprétation</p>
                <p className="text-dark-200">{interpretation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Paywall shown when a logged-in user opens a course they have not subscribed to.
const CoursePaywall = ({ certification, lang }: { certification: Certification; lang: Lang }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const autoOpen = searchParams.get('pay') === '1';

  useEffect(() => {
    if (autoOpen) setShowModal(true);
  }, [autoOpen]);

  const labels = lang === 'fr'
    ? {
        title: 'Souscription requise',
        subtitle: "Cette certification nécessite un abonnement actif. Souscrivez maintenant pour débloquer 30 jours d'accès complet.",
        priceLabel: 'Tarif',
        durationLabel: 'Durée',
        durationValue: '1 mois (30 jours)',
        cta: 'Souscrire — ' + formatPriceXof(COURSE_PRICE_XOF),
        back: 'Retour aux certifications',
        included: 'Inclus dans votre abonnement',
        feat1: 'Accès illimité aux cours et guides PDF',
        feat2: 'Examens blancs et mini-examens',
        feat3: 'Suivi de votre progression et historique',
        feat4: 'Renouvelable mois par mois',
      }
    : {
        title: 'Subscription required',
        subtitle: 'This certification requires an active subscription. Subscribe now to unlock 30 days of full access.',
        priceLabel: 'Price',
        durationLabel: 'Duration',
        durationValue: '1 month (30 days)',
        cta: 'Subscribe — ' + formatPriceXof(COURSE_PRICE_XOF),
        back: 'Back to certifications',
        included: 'Included with your subscription',
        feat1: 'Unlimited access to courses and PDF guides',
        feat2: 'Mock exams and quick exams',
        feat3: 'Progress tracking and history',
        feat4: 'Renewable month by month',
      };

  const Icon = iconMap[certification.icon] || Shield;

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/topics" className="inline-flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6">
          <ChevronLeft className="w-4 h-4" />
          {labels.back}
        </Link>

        <div className="card overflow-hidden">
          <div className="px-6 py-8 sm:px-10 sm:py-10 bg-gradient-to-br from-primary-500 to-primary-700 text-white relative">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2">
                  <Lock className="w-3 h-3" />
                  {labels.title}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">{certification.fullName || certification.name}</h1>
                <p className="text-sm text-white/85">{labels.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 sm:px-10 sm:py-8">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50 p-4">
                <p className="text-[11px] uppercase tracking-wider text-dark-500 dark:text-dark-400 font-semibold mb-1">{labels.priceLabel}</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">{formatPriceXof(COURSE_PRICE_XOF)}</p>
              </div>
              <div className="rounded-xl border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800/50 p-4">
                <p className="text-[11px] uppercase tracking-wider text-dark-500 dark:text-dark-400 font-semibold mb-1">{labels.durationLabel}</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-white">{labels.durationValue}</p>
              </div>
            </div>

            <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/40 p-5 mb-6">
              <p className="text-sm font-semibold text-primary-900 dark:text-primary-200 mb-3">{labels.included}</p>
              <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-300">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{labels.feat1}</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{labels.feat2}</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{labels.feat3}</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{labels.feat4}</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-base shadow-lg shadow-primary-500/30 transition-colors"
            >
              <Wallet className="w-5 h-5" />
              {labels.cta}
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <PaymentModal certification={certification} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export const TopicsPage = () => {
  const [searchParams] = useSearchParams();
  const certFilter = searchParams.get('cert');
  const { lang, topicsTab: activeTab, topicsExamType: activeExamType, setTopicsTab: setActiveTab, setTopicsExamType: setActiveExamType } = useStore();
  const { appUser } = useAuth();
  const allowedCourses = appUser?.allowedCourses || [];

  // Check if the cert exists in our certifications data
  const certExists = certFilter ? certifications.some(c => c.slug === certFilter) : false;

  // Redirect only if the cert slug is unknown. If the user lacks access, show paywall instead.
  if (certFilter && !certExists) {
    return <Navigate to="/topics" replace />;
  }
  if (certFilter && !allowedCourses.includes(certFilter as CertificationSlug)) {
    const certForPaywall = certifications.find(c => c.slug === certFilter)!;
    return <CoursePaywall certification={certForPaywall} lang={lang} />;
  }

  // Terminology states
  const [terminologyType, setTerminologyType] = useState<'agile' | 'hybrid'>('agile');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState({ known: 0, learning: 0 });
  const [dailyProgress, setDailyProgress] = useState(0);
  const [reviewedCards, setReviewedCards] = useState<Set<number>>(new Set());

  // PL-300 Terminology states
  const [pl300CardIndex, setPl300CardIndex] = useState(0);
  const [isPl300Flipped, setIsPl300Flipped] = useState(false);
  const [pl300Score, setPl300Score] = useState({ known: 0, learning: 0 });
  const [pl300DailyProgress, setPl300DailyProgress] = useState(0);
  const [reviewedPl300Cards, setReviewedPl300Cards] = useState<Set<number>>(new Set());

  // Formula states (PMP)
  const [currentFormulaIndex, setCurrentFormulaIndex] = useState(0);
  const [isFormulaFlipped, setIsFormulaFlipped] = useState(false);
  const [formulaScore, setFormulaScore] = useState({ known: 0, learning: 0 });
  const [reviewedFormulas, setReviewedFormulas] = useState<Set<number>>(new Set());

  // Formula states (PL-300)
  const [pl300FormulaIndex, setPl300FormulaIndex] = useState(0);
  const [isPl300FormulaFlipped, setIsPl300FormulaFlipped] = useState(false);
  const [pl300FormulaScore, setPl300FormulaScore] = useState({ known: 0, learning: 0 });
  const [reviewedPl300Formulas, setReviewedPl300Formulas] = useState<Set<number>>(new Set());

  // Domain Exam states
  const [selectedDomain, setSelectedDomain] = useState<PMPDomain | null>(null);
  const [domainQuestions, setDomainQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showRationale, setShowRationale] = useState(false);
  const [domainExamScore, setDomainExamScore] = useState({ correct: 0, incorrect: 0 });
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());

  // Mini Exam states
  const [selectedMiniExam, setSelectedMiniExam] = useState<MiniExam | null>(null);
  const [miniExamQuestions, setMiniExamQuestions] = useState<NormalizedQuestion[]>([]);
  const [currentMiniQuestionIndex, setCurrentMiniQuestionIndex] = useState(0);
  const [selectedMiniAnswer, setSelectedMiniAnswer] = useState<string | null>(null);
  const [selectedMiniAnswers, setSelectedMiniAnswers] = useState<string[]>([]);
  const [showMiniRationale, setShowMiniRationale] = useState(false);
  const [miniExamScore, setMiniExamScore] = useState({ correct: 0, incorrect: 0 });
  const [answeredMiniQuestions, setAnsweredMiniQuestions] = useState<Set<number>>(new Set());

  // Full Exam states
  const [selectedFullExam, setSelectedFullExam] = useState<FullExam | null>(null);
  const [fullExamQuestions, setFullExamQuestions] = useState<NormalizedFullQuestion[]>([]);
  const [currentFullQuestionIndex, setCurrentFullQuestionIndex] = useState(0);
  const [selectedFullAnswer, setSelectedFullAnswer] = useState<string | null>(null);
  const [selectedFullAnswers, setSelectedFullAnswers] = useState<string[]>([]);
  const [showFullRationale, setShowFullRationale] = useState(false);
  const [fullExamScore, setFullExamScore] = useState({ correct: 0, incorrect: 0 });
  const [answeredFullQuestions, setAnsweredFullQuestions] = useState<Set<number>>(new Set());

  // Timer states
  const [fullExamTimeRemaining, setFullExamTimeRemaining] = useState(0);
  const [miniExamTimeRemaining, setMiniExamTimeRemaining] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakCount, setBreakCount] = useState(0);
  const [totalBreakTimeUsed, setTotalBreakTimeUsed] = useState(0);
  const [examTimedOut, setExamTimedOut] = useState(false);
  const [miniExamTimedOut, setMiniExamTimedOut] = useState(false);

  // Answer tracking for save/review
  const [fullExamAnswerMap, setFullExamAnswerMap] = useState<Map<number, { selected: string; isCorrect: boolean }>>(new Map());
  const [miniExamAnswerMap, setMiniExamAnswerMap] = useState<Map<number, { selected: string; isCorrect: boolean }>>(new Map());
  const [domainAnswerMap, setDomainAnswerMap] = useState<Map<number, { selected: string; isCorrect: boolean }>>(new Map());

  // Timer constants
  const FULL_EXAM_DURATION = 4 * 60 * 60; // 14400s (4h)
  const DEFAULT_MINI_EXAM_DURATION = 25 * 60; // 1500s (25min)
  const MINI_EXAM_DURATION = selectedMiniExam?.duration || DEFAULT_MINI_EXAM_DURATION;
  const MAX_BREAKS = 4;
  const MAX_BREAK_TIME = 30 * 60; // 1800s (30min)

  // Refs to prevent duplicate saves
  const domainSavedRef = useRef(false);
  const miniSavedRef = useRef(false);
  const fullSavedRef = useRef(false);

  // Save domain exam result when completed
  useEffect(() => {
    if (selectedDomain && domainQuestions.length > 0 && answeredQuestions.size === domainQuestions.length && appUser && !domainSavedRef.current) {
      domainSavedRef.current = true;
      const score = Math.round((domainExamScore.correct / domainQuestions.length) * 100);
      saveExamResult({
        userId: appUser.uid,
        certification: certFilter || 'pmp',
        examType: `domain-${selectedDomain.slug}`,
        score,
        totalQuestions: domainQuestions.length,
        correctAnswers: domainExamScore.correct,
        incorrectAnswers: domainExamScore.incorrect,
        unanswered: 0,
        timeSpent: 0,
        answers: domainQuestions.map((q: { id: number; question: string; options: string[]; correct: string; rationale: string }, i: number) => {
          const ans = domainAnswerMap.get(i);
          return {
            questionId: `domain-${selectedDomain.slug}-q${i}`,
            selectedAnswers: ans ? [ans.selected] : [],
            isCorrect: ans?.isCorrect ?? false,
            questionText: q.question,
            options: q.options.map((opt: string, j: number) => ({
              id: String.fromCharCode(65 + j),
              text: opt,
              isCorrect: opt === q.correct,
            })),
            explanation: q.rationale || '',
          };
        }),
        completedAt: new Date().toISOString(),
      }).catch(console.error);
    }
  }, [answeredQuestions.size, domainQuestions.length, selectedDomain, domainExamScore, appUser, certFilter, domainAnswerMap, domainQuestions]);

  // Save mini exam result when completed
  useEffect(() => {
    if (selectedMiniExam && miniExamQuestions.length > 0 && answeredMiniQuestions.size === miniExamQuestions.length && appUser && !miniSavedRef.current) {
      miniSavedRef.current = true;
      const score = Math.round((miniExamScore.correct / miniExamQuestions.length) * 100);
      saveExamResult({
        userId: appUser.uid,
        certification: certFilter || 'pmp',
        examType: `mini-${selectedMiniExam.id}`,
        score,
        totalQuestions: miniExamQuestions.length,
        correctAnswers: miniExamScore.correct,
        incorrectAnswers: miniExamScore.incorrect,
        unanswered: 0,
        timeSpent: MINI_EXAM_DURATION - miniExamTimeRemaining,
        answers: miniExamQuestions.map((q, i) => {
          const ans = miniExamAnswerMap.get(i);
          return {
            questionId: `mini-${selectedMiniExam.id}-q${i}`,
            selectedAnswers: ans ? [ans.selected] : [],
            isCorrect: ans?.isCorrect ?? false,
            questionText: q.question,
            options: q.options.map((opt, j) => ({
              id: String.fromCharCode(65 + j),
              text: opt,
              isCorrect: opt === q.correctAnswer || opt.charAt(0) === q.correctAnswer.charAt(0),
            })),
            explanation: q.explanation || '',
          };
        }),
        completedAt: new Date().toISOString(),
      }).catch(console.error);
    }
  }, [answeredMiniQuestions.size, miniExamQuestions.length, selectedMiniExam, miniExamScore, appUser, certFilter, miniExamAnswerMap, miniExamQuestions, miniExamTimeRemaining]);

  // Save full exam result when completed
  useEffect(() => {
    if (selectedFullExam && fullExamQuestions.length > 0 && answeredFullQuestions.size === fullExamQuestions.length && appUser && !fullSavedRef.current) {
      fullSavedRef.current = true;
      const score = Math.round((fullExamScore.correct / fullExamQuestions.length) * 100);
      saveExamResult({
        userId: appUser.uid,
        certification: certFilter || 'mixed',
        examType: `full-${selectedFullExam.id}`,
        score,
        totalQuestions: fullExamQuestions.length,
        correctAnswers: fullExamScore.correct,
        incorrectAnswers: fullExamScore.incorrect,
        unanswered: 0,
        timeSpent: FULL_EXAM_DURATION - fullExamTimeRemaining,
        answers: fullExamQuestions.map((q, i) => {
          const ans = fullExamAnswerMap.get(i);
          return {
            questionId: `full-${selectedFullExam.id}-q${i}`,
            selectedAnswers: ans ? [ans.selected] : [],
            isCorrect: ans?.isCorrect ?? false,
            questionText: q.question,
            options: q.options.map((opt, j) => ({
              id: String.fromCharCode(65 + j),
              text: opt,
              isCorrect: opt === q.correctAnswer || opt.charAt(0) === q.correctAnswer.charAt(0),
            })),
            explanation: q.explanation || '',
          };
        }),
        completedAt: new Date().toISOString(),
      }).catch(console.error);
    }
  }, [answeredFullQuestions.size, fullExamQuestions.length, selectedFullExam, fullExamScore, appUser, certFilter, fullExamAnswerMap, fullExamQuestions, fullExamTimeRemaining]);

  // Reset saved refs when exams change
  useEffect(() => { domainSavedRef.current = false; }, [selectedDomain]);
  useEffect(() => { miniSavedRef.current = false; }, [selectedMiniExam]);
  useEffect(() => { fullSavedRef.current = false; }, [selectedFullExam]);

  // Reset tab to 'info' when certification changes
  useEffect(() => {
    setActiveTab('info');
  }, [certFilter, setActiveTab]);

  const DAILY_TARGET = 10;

  // Timer helper
  const formatExamTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-finish full exam (mark all unanswered as incorrect)
  const handleFullExamTimeOut = useCallback(() => {
    setExamTimedOut(true);
    const newAnswered = new Set(answeredFullQuestions);
    let incorrectCount = 0;
    for (let i = 0; i < fullExamQuestions.length; i++) {
      if (!newAnswered.has(i)) {
        newAnswered.add(i);
        incorrectCount++;
      }
    }
    setAnsweredFullQuestions(newAnswered);
    setFullExamScore(prev => ({ ...prev, incorrect: prev.incorrect + incorrectCount }));
    setShowFullRationale(true);
  }, [answeredFullQuestions, fullExamQuestions.length]);

  // Auto-finish mini exam
  const handleMiniExamTimeOut = useCallback(() => {
    setMiniExamTimedOut(true);
    const newAnswered = new Set(answeredMiniQuestions);
    let incorrectCount = 0;
    for (let i = 0; i < miniExamQuestions.length; i++) {
      if (!newAnswered.has(i)) {
        newAnswered.add(i);
        incorrectCount++;
      }
    }
    setAnsweredMiniQuestions(newAnswered);
    setMiniExamScore(prev => ({ ...prev, incorrect: prev.incorrect + incorrectCount }));
    setShowMiniRationale(true);
  }, [answeredMiniQuestions, miniExamQuestions.length]);

  // Break handlers (PMP full exam only)
  const handleStartBreak = () => {
    if (breakCount < MAX_BREAKS && totalBreakTimeUsed < MAX_BREAK_TIME) {
      setIsOnBreak(true);
      setBreakCount(prev => prev + 1);
    }
  };

  const handleEndBreak = () => {
    setIsOnBreak(false);
  };

  // Full exam timer
  useEffect(() => {
    if (!selectedFullExam || fullExamTimeRemaining <= 0 || isOnBreak || answeredFullQuestions.size === fullExamQuestions.length) return;
    const interval = setInterval(() => {
      setFullExamTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFullExamTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedFullExam, fullExamTimeRemaining, isOnBreak, answeredFullQuestions.size, fullExamQuestions.length, handleFullExamTimeOut]);

  // Mini exam timer
  useEffect(() => {
    if (!selectedMiniExam || miniExamTimeRemaining <= 0 || answeredMiniQuestions.size === miniExamQuestions.length) return;
    const interval = setInterval(() => {
      setMiniExamTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleMiniExamTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedMiniExam, miniExamTimeRemaining, answeredMiniQuestions.size, miniExamQuestions.length, handleMiniExamTimeOut]);

  // Break timer (counts up total break time used)
  useEffect(() => {
    if (!isOnBreak) return;
    const interval = setInterval(() => {
      setTotalBreakTimeUsed(prev => {
        if (prev + 1 >= MAX_BREAK_TIME) {
          clearInterval(interval);
          setIsOnBreak(false);
          return MAX_BREAK_TIME;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnBreak]);

  const isPMP = certFilter === 'pmp';
  const isPL300 = certFilter === 'pl-300';
  const isCFE = certFilter === 'cfe';
  const isCIA = certFilter === 'cia-1' || certFilter === 'cia-2' || certFilter === 'cia-3';
  const isPM4NGOs = certFilter === 'pm4ngos';
  const isCISA = certFilter === 'cisa';
  const isSocialGoodDPro = certFilter === 'social-good-dpro';
  const isProgramDPro = certFilter === 'program-dpro';
  const isFinanceDPro = certFilter === 'finance-dpro';
  const isMEALDPro = certFilter === 'meal-dpro';
  const isCAPM = certFilter === 'capm';
  const isMOSExcel = certFilter === 'mos-excel';
  const hasTabbedInterface = isPMP || isPL300 || isCFE || isCIA || isPM4NGOs
    || isCISA || isSocialGoodDPro || isProgramDPro || isFinanceDPro || isMEALDPro || isCAPM || isMOSExcel;

  // Get current terminology list
  const currentTerminologies = terminologyType === 'agile' ? allAgileTerminologies : allHybridTerminologies;
  const currentCard = currentTerminologies[currentCardIndex];

  // Reset flip when changing cards
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  const handleNextCard = () => {
    if (currentCardIndex < currentTerminologies.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const handleKnown = () => {
    if (!reviewedCards.has(currentCardIndex)) {
      setScore(prev => ({ ...prev, known: prev.known + 1 }));
      setDailyProgress(prev => Math.min(prev + 1, DAILY_TARGET));
      setReviewedCards(prev => new Set(prev).add(currentCardIndex));
    }
    handleNextCard();
  };

  const handleLearning = () => {
    if (!reviewedCards.has(currentCardIndex)) {
      setScore(prev => ({ ...prev, learning: prev.learning + 1 }));
      setDailyProgress(prev => Math.min(prev + 1, DAILY_TARGET));
      setReviewedCards(prev => new Set(prev).add(currentCardIndex));
    }
    handleNextCard();
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setScore({ known: 0, learning: 0 });
    setReviewedCards(new Set());
  };

  // PL-300 Terminology handlers
  const currentPl300Card = powerBiGlossary[pl300CardIndex];

  useEffect(() => {
    setIsPl300Flipped(false);
  }, [pl300CardIndex]);

  const handleNextPl300Card = () => {
    if (pl300CardIndex < powerBiGlossary.length - 1) {
      setPl300CardIndex(prev => prev + 1);
    }
  };

  const handlePrevPl300Card = () => {
    if (pl300CardIndex > 0) {
      setPl300CardIndex(prev => prev - 1);
    }
  };

  const handlePl300Known = () => {
    if (!reviewedPl300Cards.has(pl300CardIndex)) {
      setPl300Score(prev => ({ ...prev, known: prev.known + 1 }));
      setPl300DailyProgress(prev => Math.min(prev + 1, DAILY_TARGET));
      setReviewedPl300Cards(prev => new Set(prev).add(pl300CardIndex));
    }
    handleNextPl300Card();
  };

  const handlePl300Learning = () => {
    if (!reviewedPl300Cards.has(pl300CardIndex)) {
      setPl300Score(prev => ({ ...prev, learning: prev.learning + 1 }));
      setPl300DailyProgress(prev => Math.min(prev + 1, DAILY_TARGET));
      setReviewedPl300Cards(prev => new Set(prev).add(pl300CardIndex));
    }
    handleNextPl300Card();
  };

  const handlePl300Reset = () => {
    setPl300CardIndex(0);
    setIsPl300Flipped(false);
    setPl300Score({ known: 0, learning: 0 });
    setReviewedPl300Cards(new Set());
  };

  // Formula handlers
  const currentFormula = formulas[currentFormulaIndex];

  useEffect(() => {
    setIsFormulaFlipped(false);
  }, [currentFormulaIndex]);

  const handleNextFormula = () => {
    if (currentFormulaIndex < formulas.length - 1) {
      setCurrentFormulaIndex(prev => prev + 1);
    }
  };

  const handlePrevFormula = () => {
    if (currentFormulaIndex > 0) {
      setCurrentFormulaIndex(prev => prev - 1);
    }
  };

  const handleFormulaKnown = () => {
    if (!reviewedFormulas.has(currentFormulaIndex)) {
      setFormulaScore(prev => ({ ...prev, known: prev.known + 1 }));
      setReviewedFormulas(prev => new Set(prev).add(currentFormulaIndex));
    }
    handleNextFormula();
  };

  const handleFormulaLearning = () => {
    if (!reviewedFormulas.has(currentFormulaIndex)) {
      setFormulaScore(prev => ({ ...prev, learning: prev.learning + 1 }));
      setReviewedFormulas(prev => new Set(prev).add(currentFormulaIndex));
    }
    handleNextFormula();
  };

  const handleFormulaReset = () => {
    setCurrentFormulaIndex(0);
    setIsFormulaFlipped(false);
    setFormulaScore({ known: 0, learning: 0 });
    setReviewedFormulas(new Set());
  };

  // PL-300 Formula handlers
  const currentPl300Formula = pl300Formulas[pl300FormulaIndex];

  useEffect(() => {
    setIsPl300FormulaFlipped(false);
  }, [pl300FormulaIndex]);

  const handleNextPl300Formula = () => {
    if (pl300FormulaIndex < pl300Formulas.length - 1) {
      setPl300FormulaIndex(prev => prev + 1);
    }
  };

  const handlePrevPl300Formula = () => {
    if (pl300FormulaIndex > 0) {
      setPl300FormulaIndex(prev => prev - 1);
    }
  };

  const handlePl300FormulaKnown = () => {
    if (!reviewedPl300Formulas.has(pl300FormulaIndex)) {
      setPl300FormulaScore(prev => ({ ...prev, known: prev.known + 1 }));
      setReviewedPl300Formulas(prev => new Set(prev).add(pl300FormulaIndex));
    }
    handleNextPl300Formula();
  };

  const handlePl300FormulaLearning = () => {
    if (!reviewedPl300Formulas.has(pl300FormulaIndex)) {
      setPl300FormulaScore(prev => ({ ...prev, learning: prev.learning + 1 }));
      setReviewedPl300Formulas(prev => new Set(prev).add(pl300FormulaIndex));
    }
    handleNextPl300Formula();
  };

  const handlePl300FormulaReset = () => {
    setPl300FormulaIndex(0);
    setIsPl300FormulaFlipped(false);
    setPl300FormulaScore({ known: 0, learning: 0 });
    setReviewedPl300Formulas(new Set());
  };

  // Domain Exam handlers
  const handleSelectDomain = (domain: PMPDomain) => {
    const questions = getQuestionsByDomainSlug(domain.slug);
    setSelectedDomain(domain);
    setDomainQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowRationale(false);
    setDomainExamScore({ correct: 0, incorrect: 0 });
    setAnsweredQuestions(new Set());
    setDomainAnswerMap(new Map());
  };

  const handleBackToDomains = () => {
    setSelectedDomain(null);
    setDomainQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowRationale(false);
    setDomainAnswerMap(new Map());
  };

  const handleSelectAnswer = (answer: string) => {
    if (showRationale) return; // Already answered
    setSelectedAnswer(answer);
    setShowRationale(true);

    const currentQuestion = domainQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correct;

    if (!answeredQuestions.has(currentQuestionIndex)) {
      setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));
      setDomainAnswerMap(prev => new Map(prev).set(currentQuestionIndex, { selected: answer, isCorrect }));
      if (isCorrect) {
        setDomainExamScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setDomainExamScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < domainQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowRationale(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowRationale(false);
    }
  };

  const handleRestartDomainExam = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowRationale(false);
    setDomainExamScore({ correct: 0, incorrect: 0 });
    setAnsweredQuestions(new Set());
    setDomainAnswerMap(new Map());
  };

  const currentDomainQuestion = domainQuestions[currentQuestionIndex];

  // Mini Exam handlers
  const handleSelectMiniExam = (exam: MiniExam) => {
    setSelectedMiniExam(exam);
    setMiniExamQuestions(exam.questions);
    setCurrentMiniQuestionIndex(0);
    setSelectedMiniAnswer(null);
    setSelectedMiniAnswers([]);
    setShowMiniRationale(false);
    setMiniExamScore({ correct: 0, incorrect: 0 });
    setAnsweredMiniQuestions(new Set());
    setMiniExamTimeRemaining(exam.duration || DEFAULT_MINI_EXAM_DURATION);
    setMiniExamTimedOut(false);
    setMiniExamAnswerMap(new Map());
  };

  const handleBackToMiniExams = () => {
    setSelectedMiniExam(null);
    setMiniExamQuestions([]);
    setCurrentMiniQuestionIndex(0);
    setSelectedMiniAnswer(null);
    setSelectedMiniAnswers([]);
    setShowMiniRationale(false);
    setMiniExamTimeRemaining(0);
    setMiniExamTimedOut(false);
    setMiniExamAnswerMap(new Map());
  };

  const handleSelectMiniAnswer = (answer: string) => {
    if (showMiniRationale) return;
    const currentQuestion = miniExamQuestions[currentMiniQuestionIndex];

    // Multi-select question
    if ((currentQuestion as any).answerType === 'multiple' || (currentQuestion.correctAnswers && currentQuestion.correctAnswers.length > 1)) {
      setSelectedMiniAnswers(prev => {
        if (prev.includes(answer)) {
          return prev.filter(a => a !== answer);
        }
        return [...prev, answer];
      });
      return;
    }

    // Single-select question
    setSelectedMiniAnswer(answer);
    setShowMiniRationale(true);

    // Compare answer: exact match or letter match for "A. text" format options
    const isCorrect = answer === currentQuestion.correctAnswer ||
      (currentQuestion.correctAnswer.length === 1 && answer.charAt(0) === currentQuestion.correctAnswer);

    if (!answeredMiniQuestions.has(currentMiniQuestionIndex)) {
      setAnsweredMiniQuestions(prev => new Set(prev).add(currentMiniQuestionIndex));
      setMiniExamAnswerMap(prev => new Map(prev).set(currentMiniQuestionIndex, { selected: answer, isCorrect }));
      if (isCorrect) {
        setMiniExamScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setMiniExamScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    }
  };

  const handleValidateMultiMiniAnswer = () => {
    if (showMiniRationale) return;
    const currentQuestion = miniExamQuestions[currentMiniQuestionIndex];
    if (!currentQuestion.correctAnswers) return;

    setShowMiniRationale(true);

    const isCorrect = currentQuestion.correctAnswers.length === selectedMiniAnswers.length &&
      currentQuestion.correctAnswers.every(a => selectedMiniAnswers.includes(a));

    if (!answeredMiniQuestions.has(currentMiniQuestionIndex)) {
      setAnsweredMiniQuestions(prev => new Set(prev).add(currentMiniQuestionIndex));
      setMiniExamAnswerMap(prev => new Map(prev).set(currentMiniQuestionIndex, { selected: selectedMiniAnswers.join(' ; '), isCorrect }));
      if (isCorrect) {
        setMiniExamScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setMiniExamScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    }
  };

  const handleMiniAnswer = handleSelectMiniAnswer;

  const handleNextMiniQuestion = () => {
    if (currentMiniQuestionIndex < miniExamQuestions.length - 1) {
      setCurrentMiniQuestionIndex(prev => prev + 1);
      setSelectedMiniAnswer(null);
      setSelectedMiniAnswers([]);
      setShowMiniRationale(false);
    }
  };

  const handlePrevMiniQuestion = () => {
    if (currentMiniQuestionIndex > 0) {
      setCurrentMiniQuestionIndex(prev => prev - 1);
      setSelectedMiniAnswer(null);
      setShowMiniRationale(false);
    }
  };

  const handleRestartMiniExam = () => {
    setCurrentMiniQuestionIndex(0);
    setSelectedMiniAnswer(null);
    setSelectedMiniAnswers([]);
    setShowMiniRationale(false);
    setMiniExamScore({ correct: 0, incorrect: 0 });
    setAnsweredMiniQuestions(new Set());
    setMiniExamTimeRemaining(selectedMiniExam?.duration || DEFAULT_MINI_EXAM_DURATION);
    setMiniExamTimedOut(false);
    setMiniExamAnswerMap(new Map());
  };

  const currentMiniQuestion = miniExamQuestions[currentMiniQuestionIndex];

  // Full Exam handlers
  const handleSelectFullExam = (exam: FullExam) => {
    setSelectedFullExam(exam);
    setFullExamQuestions(exam.questions);
    setCurrentFullQuestionIndex(0);
    setSelectedFullAnswer(null);
    setSelectedFullAnswers([]);
    setShowFullRationale(false);
    setFullExamScore({ correct: 0, incorrect: 0 });
    setAnsweredFullQuestions(new Set());
    setFullExamTimeRemaining(FULL_EXAM_DURATION);
    setBreakCount(0);
    setTotalBreakTimeUsed(0);
    setIsOnBreak(false);
    setExamTimedOut(false);
    setFullExamAnswerMap(new Map());
  };

  const handleBackToFullExams = () => {
    setSelectedFullExam(null);
    setFullExamQuestions([]);
    setCurrentFullQuestionIndex(0);
    setSelectedFullAnswer(null);
    setSelectedFullAnswers([]);
    setShowFullRationale(false);
    setFullExamTimeRemaining(0);
    setBreakCount(0);
    setTotalBreakTimeUsed(0);
    setIsOnBreak(false);
    setExamTimedOut(false);
    setFullExamAnswerMap(new Map());
  };

  // Helper: detect multi-select from correctAnswers, rawAnswer, or question text
  const getMultiSelectInfo = (question: typeof fullExamQuestions[number]) => {
    // Method 0: check answerType field preserved from original data
    if ((question as any).answerType === 'multiple') {
      return { isMulti: true, correctAnswers: question.correctAnswers || [] };
    }
    // Method 1: correctAnswers already computed by normalize
    if (question.correctAnswers && question.correctAnswers.length > 1) {
      return { isMulti: true, correctAnswers: question.correctAnswers };
    }
    // Method 2: use rawAnswer field (original "A, B, C" format) as fallback
    const raw = (question as any).rawAnswer || '';
    if (raw.includes(',')) {
      const letters = raw.split(',').map((s: string) => s.trim()).filter((s: string) => /^[A-D]$/.test(s));
      if (letters.length > 1) {
        const resolved = letters.map((l: string) => {
          const idx = l.charCodeAt(0) - 65;
          return idx >= 0 && idx < question.options.length ? question.options[idx] : l;
        });
        return { isMulti: true, correctAnswers: resolved };
      }
    }
    // Method 3: detect from question text "(Select N options/answers)"
    const selectMatch = question.question.match(/\(Select\s+(\d+)/i);
    if (selectMatch && parseInt(selectMatch[1]) > 1) {
      // Try to resolve from raw answer or options
      if (raw) {
        const letters = raw.split(',').map((s: string) => s.trim()).filter((s: string) => /^[A-D]$/.test(s));
        if (letters.length > 1) {
          const resolved = letters.map((l: string) => {
            const idx = l.charCodeAt(0) - 65;
            return idx >= 0 && idx < question.options.length ? question.options[idx] : l;
          });
          return { isMulti: true, correctAnswers: resolved };
        }
      }
      // Last resort: we know it's multi but can't determine answers - still enable multi-select UI
      const expectedCount = parseInt(selectMatch[1]);
      return { isMulti: true, correctAnswers: undefined, expectedCount };
    }
    return { isMulti: false, correctAnswers: undefined };
  };

  const handleSelectFullAnswer = (answer: string) => {
    if (showFullRationale) return;
    const currentQuestion = fullExamQuestions[currentFullQuestionIndex];
    const { isMulti } = getMultiSelectInfo(currentQuestion);

    // Multi-select question
    if (isMulti) {
      setSelectedFullAnswers(prev => {
        if (prev.includes(answer)) {
          return prev.filter(a => a !== answer);
        }
        return [...prev, answer];
      });
      return;
    }

    // Single-select question
    setSelectedFullAnswer(answer);
    setShowFullRationale(true);

    const isCorrect = answer === currentQuestion.correctAnswer ||
      (currentQuestion.correctAnswer.length <= 2 && answer.charAt(0) === currentQuestion.correctAnswer.charAt(0));

    if (!answeredFullQuestions.has(currentFullQuestionIndex)) {
      setAnsweredFullQuestions(prev => new Set(prev).add(currentFullQuestionIndex));
      setFullExamAnswerMap(prev => new Map(prev).set(currentFullQuestionIndex, { selected: answer, isCorrect }));
      if (isCorrect) {
        setFullExamScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setFullExamScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    }
  };

  const handleValidateMultiFullAnswer = () => {
    if (showFullRationale) return;
    const currentQuestion = fullExamQuestions[currentFullQuestionIndex];
    const { correctAnswers } = getMultiSelectInfo(currentQuestion);
    if (!correctAnswers || correctAnswers.length === 0) return;

    setShowFullRationale(true);

    const isCorrect = correctAnswers.length === selectedFullAnswers.length &&
      correctAnswers.every(a => selectedFullAnswers.includes(a));

    if (!answeredFullQuestions.has(currentFullQuestionIndex)) {
      setAnsweredFullQuestions(prev => new Set(prev).add(currentFullQuestionIndex));
      setFullExamAnswerMap(prev => new Map(prev).set(currentFullQuestionIndex, { selected: selectedFullAnswers.join(' ; '), isCorrect }));
      if (isCorrect) {
        setFullExamScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setFullExamScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    }
  };

  const handleNextFullQuestion = () => {
    if (currentFullQuestionIndex < fullExamQuestions.length - 1) {
      setCurrentFullQuestionIndex(prev => prev + 1);
      setSelectedFullAnswer(null);
      setSelectedFullAnswers([]);
      setShowFullRationale(false);
    }
  };

  const handlePrevFullQuestion = () => {
    if (currentFullQuestionIndex > 0) {
      setCurrentFullQuestionIndex(prev => prev - 1);
      setSelectedFullAnswer(null);
      setSelectedFullAnswers([]);
      setShowFullRationale(false);
    }
  };

  const handleRestartFullExam = () => {
    setCurrentFullQuestionIndex(0);
    setSelectedFullAnswer(null);
    setSelectedFullAnswers([]);
    setShowFullRationale(false);
    setFullExamScore({ correct: 0, incorrect: 0 });
    setAnsweredFullQuestions(new Set());
    setFullExamTimeRemaining(FULL_EXAM_DURATION);
    setBreakCount(0);
    setTotalBreakTimeUsed(0);
    setIsOnBreak(false);
    setExamTimedOut(false);
    setFullExamAnswerMap(new Map());
  };

  const currentFullQuestion = fullExamQuestions[currentFullQuestionIndex];

  // Get certification info if filtered
  const activeCertification = certFilter
    ? certifications.find(c => c.slug === certFilter)
    : null;

  // Check if user has access to the current cert
  const hasAccess = certFilter
    ? allowedCourses.includes(certFilter as CertificationSlug)
    : true;

  // Filter categories based on cert parameter and allowed courses
  const filteredCategories = certFilter
    ? (hasAccess ? categories.filter(c => c.slug === certFilter) : [])
    : categories.filter(c => allowedCourses.includes(c.slug as CertificationSlug));

  // Filter certifications shown in tabs by allowed courses
  const allowedCertifications = certifications.filter(c => allowedCourses.includes(c.slug as CertificationSlug));

  const labels = {
    title: lang === 'fr' ? 'Révisions' : 'Exam Topics',
    subtitle: lang === 'fr' ? 'Sélectionnez un sujet pour commencer à réviser' : 'Select a topic to start reviewing',
    allCertifications: lang === 'fr' ? 'Accueil' : 'Home',
    chapters: lang === 'fr' ? 'Chapitres' : 'Chapters',
    questions: 'questions',
    explore: lang === 'fr' ? 'Explorer' : 'Explore',
    exploreThis: lang === 'fr' ? 'Explorer ce sujet' : 'Explore this topic',
    subcategories: lang === 'fr' ? 'Modules' : 'Modules',
  };

  // Render a single category/subcategory card
  const renderTopicCard = (category: Category, parentColor?: string) => {
    const color = parentColor || category.color || 'primary';
    const colors = colorMap[color] || colorMap.primary;
    const Icon = iconMap[category.icon] || Shield;
    const allTopics = category.topics || [];
    const totalQuestions = allTopics.reduce((sum, t) => sum + t.questionCount, 0);

    if (allTopics.length === 0) return null;

    return (
      <div key={category.id} className="card overflow-hidden">
        {/* Topic Header */}
        <div className="p-6 border-b border-dark-200 dark:border-dark-700">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-xl font-bold text-dark-900 dark:text-white">
                  {category.name}
                </h2>
                {totalQuestions > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${colors.badge}`}>
                    {totalQuestions} Q
                  </span>
                )}
              </div>
              <p className="text-dark-600 dark:text-dark-400 mb-3">
                {category.description}
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-dark-500 dark:text-dark-400">
                  <BookOpen className="w-4 h-4" />
                  {totalQuestions} {labels.questions}
                </span>
                <span className="text-dark-500 dark:text-dark-400">
                  {allTopics.length} topics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Topics/Chapters */}
        <div className="p-4 bg-dark-50 dark:bg-dark-800/50">
          <h3 className="text-xs font-semibold text-dark-500 dark:text-dark-400 uppercase tracking-wider mb-3">
            Topics
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/topics/${topic.slug}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-dark-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-dark-200 dark:border-dark-600 transition-colors group"
              >
                <span className="text-sm text-dark-700 dark:text-dark-300 group-hover:text-primary-700 dark:group-hover:text-primary-400 truncate">
                  {topic.name}
                </span>
                <span className="text-xs text-dark-400 ml-2 flex-shrink-0">
                  {topic.questionCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-dark-50 dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          {/* Breadcrumb if filtered */}
          {activeCertification && (
            <div className="flex items-center gap-2 text-sm mb-4">
              <Link to="/" className="text-dark-500 hover:text-primary-600 dark:text-dark-400 dark:hover:text-primary-400">
                {labels.allCertifications}
              </Link>
              <ChevronRight className="w-4 h-4 text-dark-400" />
              <span className="text-dark-900 dark:text-white font-medium">
                {activeCertification.name} - {activeCertification.fullName}
              </span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
            {activeCertification
              ? `${activeCertification.name} - ${labels.title}`
              : labels.title
            }
          </h1>
          <p className="text-dark-600 dark:text-dark-400">
            {labels.subtitle}
          </p>

          {/* Certification filter tabs */}
          {!certFilter && (
            <div className="flex flex-wrap gap-2 mt-6">
              <Link
                to="/topics"
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                  !certFilter
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                    : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:shadow-md'
                }`}
              >
                {lang === 'fr' ? 'Tous' : 'All'}
              </Link>
              {allowedCertifications.map(cert => (
                  <Link
                    key={cert.id}
                    to={`/topics?cert=${cert.slug}`}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:shadow-md`}
                  >
                    {cert.name}
                  </Link>
              ))}
            </div>
          )}
        </div>

        {/* Tabbed Interface (PMP, PL-300, CFE, CIA) */}
        {hasTabbedInterface && activeCertification ? (
          <>
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 p-1 bg-dark-100 dark:bg-dark-800 rounded-xl">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    activeTab === 'info'
                      ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-md'
                      : 'text-dark-600 dark:text-dark-400 hover:bg-white/50 dark:hover:bg-dark-700/50'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  {lang === 'fr' ? 'Informations générales' : 'General Information'}
                </button>
                {hasAccess && (
                  <>
                    <button
                      onClick={() => setActiveTab('terminologies')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        activeTab === 'terminologies'
                          ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-md'
                          : 'text-dark-600 dark:text-dark-400 hover:bg-white/50 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      <BookText className="w-4 h-4" />
                      {isPMP
                        ? (lang === 'fr' ? 'Terminologies (Agile et Prédictif)' : 'Terminologies (Agile & Predictive)')
                        : (lang === 'fr' ? 'Terminologies' : 'Terminologies')}
                    </button>
                    <button
                      onClick={() => setActiveTab('exams')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        activeTab === 'exams'
                          ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-md'
                          : 'text-dark-600 dark:text-dark-400 hover:bg-white/50 dark:hover:bg-dark-700/50'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      {lang === 'fr' ? 'Formules & Examens' : 'Formulas & Exams'}
                    </button>
                    {certificationGuides[certFilter] && (
                      <button
                        onClick={() => setActiveTab('guides')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          activeTab === 'guides'
                            ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-md'
                            : 'text-dark-600 dark:text-dark-400 hover:bg-white/50 dark:hover:bg-dark-700/50'
                        }`}
                      >
                        <BookOpen className="w-4 h-4" />
                        {lang === 'fr' ? 'Guides' : 'Guides'}
                      </button>
                    )}
                    {certificationCourses[certFilter] && (
                      <button
                        onClick={() => setActiveTab('cours')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          activeTab === 'cours'
                            ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-md'
                            : 'text-dark-600 dark:text-dark-400 hover:bg-white/50 dark:hover:bg-dark-700/50'
                        }`}
                      >
                        <Download className="w-4 h-4" />
                        {lang === 'fr' ? 'Cours' : 'Courses'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 border border-dark-200 dark:border-dark-700 shadow-lg">
                <p className="text-dark-700 dark:text-dark-300 text-lg leading-relaxed mb-6">
                  {activeCertification.detailedDescription}
                </p>
                {activeCertification.examOverview && (
                  <div className="mb-6 p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                    <p className="text-dark-900 dark:text-white font-semibold mb-3">
                      {lang === 'fr' ? 'Aperçu de l\'examen' : 'Exam Overview'}
                    </p>
                    <div className="text-dark-700 dark:text-dark-300 text-sm leading-relaxed whitespace-pre-line">
                      {activeCertification.examOverview.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <strong key={i} className="text-dark-900 dark:text-white">{part.slice(2, -2)}</strong>
                          : <span key={i}>{part}</span>
                      )}
                    </div>
                  </div>
                )}
                {activeCertification.highlights && activeCertification.highlights.length > 0 && (
                  <div className="mb-6">
                    <p className="text-dark-900 dark:text-white font-semibold mb-4">
                      {lang === 'fr'
                        ? (isPL300 ? 'Elle atteste notamment de votre aptitude à :' : 'Elle valide votre capacité à :')
                        : 'It validates your ability to:'}
                    </p>
                    <ul className="space-y-3">
                      {activeCertification.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3 text-dark-600 dark:text-dark-400">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {isPL300 && (
                  <p className="text-dark-700 dark:text-dark-300 text-base leading-relaxed mb-6">
                    La certification PL-300 confirme votre capacité à agir comme un véritable analyste de données, capable de créer de la valeur durable à partir des données de l'organisation.
                  </p>
                )}
                {activeCertification.technicalInfo && (
                  <div className="mb-6">
                    <p className="text-dark-900 dark:text-white font-semibold mb-4">
                      {lang === 'fr' ? 'Informations techniques' : 'Technical Information'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-100 dark:bg-dark-800">
                        <Briefcase className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-dark-500">{lang === 'fr' ? 'Organisme' : 'Organization'}</p>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">{activeCertification.technicalInfo.organization}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-100 dark:bg-dark-800">
                        <Clock className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-dark-500">{lang === 'fr' ? 'Durée' : 'Duration'}</p>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">{activeCertification.technicalInfo.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-100 dark:bg-dark-800">
                        <ClipboardList className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-dark-500">{lang === 'fr' ? 'Nombre de questions' : 'Question count'}</p>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">{activeCertification.technicalInfo.questionCount}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-100 dark:bg-dark-800">
                        <BookOpen className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-dark-500">{lang === 'fr' ? 'Langue' : 'Language'}</p>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">{activeCertification.technicalInfo.language}</p>
                        </div>
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-3 p-3 rounded-lg bg-dark-100 dark:bg-dark-800">
                        <FileText className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-dark-500">Format</p>
                          <p className="text-sm font-medium text-dark-900 dark:text-white">{activeCertification.technicalInfo.format}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-dark-900 dark:text-white font-semibold">
                  {lang === 'fr' ? 'Pour plus d\'informations cliquer sur : ' : 'For more information click on: '}
                  {(isPMP || isCAPM) ? (
                    <a href="https://www.pmi.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300">
                      pmi.org
                    </a>
                  ) : isPL300 ? (
                    <a href="https://learn.microsoft.com/fr-fr/credentials/certifications/data-analyst-associate/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300">
                      microsoft.com
                    </a>
                  ) : isCFE ? (
                    <a href="https://www.acfe.com/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300">
                      acfe.com
                    </a>
                  ) : isCIA ? (
                    <a href="https://www.theiia.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300">
                      theiia.org
                    </a>
                  ) : isCISA ? (
                    <a href="https://www.isaca.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300">
                      isaca.org
                    </a>
                  ) : (isPM4NGOs || isSocialGoodDPro || isProgramDPro || isFinanceDPro || isMEALDPro) ? (
                    <a href="https://www.pm4ngos.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300">
                      pm4ngos.org
                    </a>
                  ) : null}
                </p>
              </div>
            )}

            {/* No access banner */}
            {activeTab === 'info' && !hasAccess && (
              <div className="mt-6 p-5 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/40 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary-500" />
                </div>
                <p className="text-primary-800 dark:text-primary-300 font-semibold mb-1">
                  {lang === 'fr' ? 'Accès non autorisé' : 'Access not authorized'}
                </p>
                <p className="text-primary-600 dark:text-primary-400 text-sm">
                  {lang === 'fr'
                    ? 'Vous n\'avez pas encore accès à cette certification. Veuillez contacter l\'administrateur pour obtenir l\'accès.'
                    : 'You do not have access to this certification yet. Please contact the administrator to get access.'}
                </p>
              </div>
            )}

            {activeTab === 'cours' && certificationCourses[certFilter] && (
              <div className="space-y-6">
                {certificationCourses[certFilter].map((group) => (
                  <div key={group.category} className="rounded-2xl bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 border border-dark-200 dark:border-dark-700 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-primary-50 dark:bg-primary-900/20 border-b border-dark-200 dark:border-dark-700">
                      <h3 className="text-lg font-bold text-dark-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-500" />
                        {group.category}
                      </h3>
                    </div>
                    <div className="divide-y divide-dark-100 dark:divide-dark-700">
                      {group.files.map((file) => (
                        <a
                          key={file.url}
                          href={file.url}
                          download
                          className="flex items-center gap-3 px-6 py-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-dark-200 dark:bg-dark-800/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-dark-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{file.name}</p>
                            <p className="text-xs text-dark-500">PDF</p>
                          </div>
                          <Download className="w-5 h-5 text-dark-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'guides' && certificationGuides[certFilter] && (
              <div className="space-y-6">
                {certificationGuides[certFilter].length > 0 ? (
                  <div className="rounded-2xl bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 border border-dark-200 dark:border-dark-700 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-primary-50 dark:bg-primary-900/20 border-b border-dark-200 dark:border-dark-700">
                      <h3 className="text-lg font-bold text-dark-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-500" />
                        {lang === 'fr' ? `Guides ${activeCertification?.name}` : `${activeCertification?.name} Guides`}
                      </h3>
                      <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                        {lang === 'fr' ? `${certificationGuides[certFilter].length} guide(s) disponible(s)` : `${certificationGuides[certFilter].length} guide(s) available`}
                      </p>
                    </div>
                    <div className="divide-y divide-dark-100 dark:divide-dark-700">
                      {certificationGuides[certFilter].map((guide) => (
                        <a
                          key={guide.url}
                          href={guide.url}
                          download
                          className="flex items-center gap-3 px-6 py-4 hover:bg-dark-50 dark:hover:bg-dark-800/50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-primary-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-dark-900 dark:text-white truncate">{guide.name}</p>
                            <p className="text-xs text-dark-500">PDF</p>
                          </div>
                          <Download className="w-5 h-5 text-dark-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 border border-dark-200 dark:border-dark-700 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                      {lang === 'fr' ? `Guides ${activeCertification?.name}` : `${activeCertification?.name} Guides`}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400">
                      {lang === 'fr' ? 'Aucun guide disponible pour cette certification.' : 'No guides available for this certification.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'terminologies' && (isCFE || isCIA || isPM4NGOs || isCISA || isSocialGoodDPro || isProgramDPro || isFinanceDPro || isMEALDPro || isCAPM || isMOSExcel) && (
              <div className="p-8 rounded-2xl bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 border border-dark-200 dark:border-dark-700 shadow-lg text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <BookText className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                  {lang === 'fr' ? `Terminologies ${activeCertification?.name}` : `${activeCertification?.name} Terminologies`}
                </h3>
                <p className="text-dark-600 dark:text-dark-400">
                  {lang === 'fr' ? 'Contenu à venir prochainement...' : 'Content coming soon...'}
                </p>
              </div>
            )}

            {activeTab === 'terminologies' && isPL300 && (
              <div className="space-y-6">
                {/* Daily Progress & Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Daily Target */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-700/10 border border-primary-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Objectif quotidien' : 'Daily Target'}</p>
                        <p className="text-lg font-bold text-dark-900 dark:text-white">{pl300DailyProgress}/{DAILY_TARGET}</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500"
                        style={{ width: `${(pl300DailyProgress / DAILY_TARGET) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Known */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Maîtrisés' : 'Known'}</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{pl300Score.known}</p>
                      </div>
                    </div>
                  </div>

                  {/* Learning */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-400/10 to-primary-600/10 border border-primary-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <BookText className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'En apprentissage' : 'Learning'}</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{pl300Score.learning}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Counter */}
                <div className="text-center">
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    {lang === 'fr' ? 'Terme' : 'Term'} {pl300CardIndex + 1} / {powerBiGlossary.length}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-700 rounded-full transition-all duration-500"
                    style={{ width: `${((pl300CardIndex + 1) / powerBiGlossary.length) * 100}%` }}
                  />
                </div>

                {/* Flashcard */}
                {currentPl300Card && (
                  <Flashcard
                    term={currentPl300Card.term}
                    english={currentPl300Card.english}
                    description={currentPl300Card.description}
                    isFlipped={isPl300Flipped}
                    onFlip={() => setIsPl300Flipped(!isPl300Flipped)}
                  />
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handlePrevPl300Card}
                    disabled={pl300CardIndex === 0}
                    className="p-3 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handlePl300Learning}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    {lang === 'fr' ? 'En apprentissage' : 'Learning'}
                  </button>

                  <button
                    onClick={handlePl300Known}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {lang === 'fr' ? 'Maîtrisé' : 'Known'}
                  </button>

                  <button
                    onClick={handleNextPl300Card}
                    disabled={pl300CardIndex === powerBiGlossary.length - 1}
                    className="p-3 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Reset Button */}
                <div className="text-center">
                  <button
                    onClick={handlePl300Reset}
                    className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
                  </button>
                </div>

                {/* Completion */}
                {reviewedPl300Cards.size === powerBiGlossary.length && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                    <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                      {lang === 'fr' ? 'Toutes les terminologies ont été révisées !' : 'All terminologies reviewed!'}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400 mb-2">
                      {lang === 'fr'
                        ? `Maîtrisés: ${pl300Score.known} | En apprentissage: ${pl300Score.learning}`
                        : `Known: ${pl300Score.known} | Learning: ${pl300Score.learning}`}
                    </p>
                    <button
                      onClick={handlePl300Reset}
                      className="mt-3 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {lang === 'fr' ? 'Recommencer' : 'Restart'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'terminologies' && isPMP && (
              <div className="space-y-6">
                {/* Daily Progress & Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Daily Target */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-400/10 to-primary-600/10 border border-primary-500/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Objectif quotidien' : 'Daily Target'}</p>
                        <p className="text-lg font-bold text-dark-900 dark:text-white">{dailyProgress}/{DAILY_TARGET}</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${(dailyProgress / DAILY_TARGET) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Known */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Maîtrisés' : 'Known'}</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{score.known}</p>
                      </div>
                    </div>
                  </div>

                  {/* Learning */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-400/10 to-primary-600/10 border border-primary-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                        <BookText className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'En apprentissage' : 'Learning'}</p>
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{score.learning}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terminology Type Selector */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => { setTerminologyType('agile'); setCurrentCardIndex(0); setIsFlipped(false); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      terminologyType === 'agile'
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Agile ({allAgileTerminologies.length})
                  </button>
                  <button
                    onClick={() => { setTerminologyType('hybrid'); setCurrentCardIndex(0); setIsFlipped(false); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      terminologyType === 'hybrid'
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    {lang === 'fr' ? 'Prédictif/Hybride' : 'Predictive/Hybrid'} ({allHybridTerminologies.length})
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
                  </button>
                </div>

                {/* Card Counter */}
                <div className="text-center">
                  <p className="text-sm text-dark-500 dark:text-dark-400">
                    {lang === 'fr' ? 'Carte' : 'Card'} {currentCardIndex + 1} / {currentTerminologies.length}
                  </p>
                </div>

                {/* Flashcard */}
                {currentCard && (
                  <div className="max-w-lg mx-auto">
                    <Flashcard
                      term={currentCard.term}
                      english={currentCard.english}
                      description={currentCard.description}
                      isFlipped={isFlipped}
                      onFlip={() => setIsFlipped(!isFlipped)}
                    />
                  </div>
                )}

                {/* Navigation & Action Buttons */}
                <div className="flex flex-col items-center gap-4">
                  {/* Navigation */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handlePrevCard}
                      disabled={currentCardIndex === 0}
                      className="p-3 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextCard}
                      disabled={currentCardIndex === currentTerminologies.length - 1}
                      className="p-3 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLearning}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <BookText className="w-5 h-5" />
                      {lang === 'fr' ? 'À réviser' : 'Still Learning'}
                    </button>
                    <button
                      onClick={handleKnown}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {lang === 'fr' ? 'Je connais' : 'I Know This'}
                    </button>
                  </div>
                </div>

                {/* Completion Message */}
                {dailyProgress >= DAILY_TARGET && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                    <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                      {lang === 'fr' ? 'Objectif atteint !' : 'Daily Goal Achieved!'}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400">
                      {lang === 'fr'
                        ? 'Félicitations ! Vous avez atteint votre objectif quotidien de 10 terminologies.'
                        : 'Congratulations! You have reached your daily goal of 10 terminologies.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'exams' && (isCFE || isCIA || isPM4NGOs || isCISA || isSocialGoodDPro || isProgramDPro || isFinanceDPro || isMEALDPro || isCAPM || isMOSExcel) && (
              <div className="space-y-6">
                {/* Exam Type Sub-tabs */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveExamType('formulas')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'formulas'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                    {lang === 'fr' ? 'Formules' : 'Formulas'}
                  </button>
                  <button
                    onClick={() => setActiveExamType('domain')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'domain'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    {lang === 'fr' ? 'Examens par domaine' : 'By Domain'}
                  </button>
                  <button
                    onClick={() => setActiveExamType('mini')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'mini'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {lang === 'fr' ? 'Mini examen' : 'Mini Exam'}
                  </button>
                  <button
                    onClick={() => setActiveExamType('full')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'full'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {lang === 'fr' ? 'Examen complet' : 'Full Exam'}
                  </button>
                </div>

                {/* Placeholder content for formulas/domain sub-tabs */}
                {(activeExamType === 'formulas' || activeExamType === 'domain' || (activeExamType === 'mini' && certFilter !== 'cia-1' && certFilter !== 'cia-2' && certFilter !== 'cia-3' && certFilter !== 'cisa' && certFilter !== 'finance-dpro' && certFilter !== 'pm4ngos' && certFilter !== 'social-good-dpro' && certFilter !== 'meal-dpro' && certFilter !== 'program-dpro' && certFilter !== 'pl-300')) && (
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 border border-dark-200 dark:border-dark-700 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      {activeExamType === 'formulas' && <Calculator className="w-8 h-8 text-primary-500" />}
                      {activeExamType === 'domain' && <Target className="w-8 h-8 text-primary-500" />}
                      {activeExamType === 'mini' && <Zap className="w-8 h-8 text-primary-500" />}
                    </div>
                    <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                      {activeExamType === 'formulas' && (lang === 'fr' ? `Formules ${activeCertification?.name}` : `${activeCertification?.name} Formulas`)}
                      {activeExamType === 'domain' && (lang === 'fr' ? `Examens par domaine ${activeCertification?.name}` : `${activeCertification?.name} Domain Exams`)}
                      {activeExamType === 'mini' && (lang === 'fr' ? `Mini examens ${activeCertification?.name}` : `${activeCertification?.name} Mini Exams`)}
                    </h3>
                    <p className="text-dark-600 dark:text-dark-400">
                      {lang === 'fr' ? 'Contenu à venir prochainement...' : 'Content coming soon...'}
                    </p>
                  </div>
                )}

                {/* CIA Part 1 Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'cia-1' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalCiaPart1MiniExamQuestions} questions réparties sur ${ciaPart1MiniExams.length} mini examens`
                              : `${totalCiaPart1MiniExamQuestions} questions across ${ciaPart1MiniExams.length} mini exams`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {ciaPart1MiniExams.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleSelectMiniExam(exam)}
                              className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'fr' ? exam.nameFr : exam.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                      {exam.questionCount} questions
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4" />
                                      {lang === 'fr' ? 'Démarrer' : 'Start'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Mini Exam Mode - reuses shared mini exam state */}
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button
                              onClick={handleBackToMiniExams}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}
                            </button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                {lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}
                              </span>
                              <button
                                onClick={handleRestartMiniExam}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {lang === 'fr' ? 'Recommencer' : 'Restart'}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6" />
                                <div>
                                  <h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3>
                                  <p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}>
                                <Timer className="w-5 h-5" />
                                {formatExamTime(miniExamTimeRemaining)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                              <XCircle className="w-5 h-5 text-dark-400" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p>
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }}
                            />
                          </div>

                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">
                                {currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}
                              </h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);

                                  return (
                                    <button
                                      key={optIndex}
                                      onClick={() => !isAnswered && handleMiniAnswer(option)}
                                      disabled={isAnswered}
                                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        isAnswered
                                          ? isCorrect
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : isSelected
                                              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                                              : 'border-dark-200 dark:border-dark-700 opacity-50'
                                          : isSelected
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                          isAnswered && isCorrect
                                            ? 'bg-green-500 text-white'
                                            : isAnswered && isSelected
                                              ? 'bg-red-400 text-white'
                                              : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300'
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <span className="text-dark-800 dark:text-dark-200">{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {showMiniRationale && (
                                <div className={`mt-4 p-4 rounded-xl border ${
                                  (selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer))
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    {(selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer)) ? (
                                      <><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>
                                    ) : (
                                      <><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>
                                    )}
                                  </div>
                                  {!(selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer)) && (
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                      {lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}
                                    </p>
                                  )}
                                  <p className="text-sm text-dark-700 dark:text-dark-300">
                                    <strong>{lang === 'fr' ? 'Explication:' : 'Explanation:'}</strong>{' '}
                                    {miniExamQuestions[currentMiniQuestionIndex].explanation}
                                  </p>
                                </div>
                              )}

                              {showMiniRationale && currentMiniQuestionIndex < miniExamQuestions.length - 1 && (
                                <button
                                  onClick={handleNextMiniQuestion}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Question suivante' : 'Next Question'}
                                </button>
                              )}

                              {showMiniRationale && currentMiniQuestionIndex === miniExamQuestions.length - 1 && (
                                <button
                                  onClick={handleBackToMiniExams}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Terminer l\'examen' : 'Finish Exam'}
                                </button>
                              )}
                            </div>
                          )}

                          {answeredMiniQuestions.size === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary-500" />
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                {miniExamTimedOut
                                  ? (lang === 'fr' ? 'Temps écoulé !' : 'Time\'s up!')
                                  : (lang === 'fr' ? 'Examen terminé !' : 'Exam Complete!')}
                              </h3>
                              {miniExamTimedOut && (
                                <p className="text-dark-600 dark:text-dark-400 mb-2">
                                  {lang === 'fr' ? 'Le temps imparti est écoulé.' : 'The allotted time has expired.'}
                                </p>
                              )}
                              <p className="text-lg text-dark-700 dark:text-dark-300">
                                {lang === 'fr'
                                  ? `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`
                                  : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* CIA Part 2 Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'cia-2' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalCiaPart2MiniExamQuestions} questions réparties sur ${ciaPart2MiniExams.length} mini examens`
                              : `${totalCiaPart2MiniExamQuestions} questions across ${ciaPart2MiniExams.length} mini exams`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {ciaPart2MiniExams.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleSelectMiniExam(exam)}
                              className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'fr' ? exam.nameFr : exam.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                      {exam.questionCount} questions
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4" />
                                      {lang === 'fr' ? 'Démarrer' : 'Start'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button
                              onClick={handleBackToMiniExams}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}
                            </button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                {lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}
                              </span>
                              <button
                                onClick={handleRestartMiniExam}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {lang === 'fr' ? 'Recommencer' : 'Restart'}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6" />
                                <div>
                                  <h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3>
                                  <p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}>
                                <Timer className="w-5 h-5" />
                                {formatExamTime(miniExamTimeRemaining)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                              <XCircle className="w-5 h-5 text-dark-400" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p>
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }}
                            />
                          </div>

                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">
                                {currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}
                              </h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);

                                  return (
                                    <button
                                      key={optIndex}
                                      onClick={() => !isAnswered && handleMiniAnswer(option)}
                                      disabled={isAnswered}
                                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        isAnswered
                                          ? isCorrect
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : isSelected
                                              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                                              : 'border-dark-200 dark:border-dark-700 opacity-50'
                                          : isSelected
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                          isAnswered && isCorrect
                                            ? 'bg-green-500 text-white'
                                            : isAnswered && isSelected
                                              ? 'bg-red-400 text-white'
                                              : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300'
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <span className="text-dark-800 dark:text-dark-200">{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {showMiniRationale && (
                                <div className={`mt-4 p-4 rounded-xl border ${
                                  (selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer))
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    {(selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer)) ? (
                                      <><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>
                                    ) : (
                                      <><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>
                                    )}
                                  </div>
                                  {!(selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer)) && (
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                      {lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}
                                    </p>
                                  )}
                                  <p className="text-sm text-dark-700 dark:text-dark-300">
                                    <strong>{lang === 'fr' ? 'Explication:' : 'Explanation:'}</strong>{' '}
                                    {miniExamQuestions[currentMiniQuestionIndex].explanation}
                                  </p>
                                </div>
                              )}

                              {showMiniRationale && currentMiniQuestionIndex < miniExamQuestions.length - 1 && (
                                <button
                                  onClick={handleNextMiniQuestion}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Question suivante' : 'Next Question'}
                                </button>
                              )}

                              {showMiniRationale && currentMiniQuestionIndex === miniExamQuestions.length - 1 && (
                                <button
                                  onClick={handleBackToMiniExams}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Terminer l\'examen' : 'Finish Exam'}
                                </button>
                              )}
                            </div>
                          )}

                          {answeredMiniQuestions.size === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary-500" />
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                {miniExamTimedOut
                                  ? (lang === 'fr' ? 'Temps écoulé !' : 'Time\'s up!')
                                  : (lang === 'fr' ? 'Examen terminé !' : 'Exam Complete!')}
                              </h3>
                              {miniExamTimedOut && (
                                <p className="text-dark-600 dark:text-dark-400 mb-2">
                                  {lang === 'fr' ? 'Le temps imparti est écoulé.' : 'The allotted time has expired.'}
                                </p>
                              )}
                              <p className="text-lg text-dark-700 dark:text-dark-300">
                                {lang === 'fr'
                                  ? `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`
                                  : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* CIA Part 3 Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'cia-3' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalCiaPart3MiniExamQuestions} questions réparties sur ${ciaPart3MiniExams.length} mini examens`
                              : `${totalCiaPart3MiniExamQuestions} questions across ${ciaPart3MiniExams.length} mini exams`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {ciaPart3MiniExams.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleSelectMiniExam(exam)}
                              className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'fr' ? exam.nameFr : exam.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                      {exam.questionCount} questions
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4" />
                                      {lang === 'fr' ? 'Démarrer' : 'Start'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button
                              onClick={handleBackToMiniExams}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}
                            </button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                {lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}
                              </span>
                              <button
                                onClick={handleRestartMiniExam}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {lang === 'fr' ? 'Recommencer' : 'Restart'}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6" />
                                <div>
                                  <h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3>
                                  <p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}>
                                <Timer className="w-5 h-5" />
                                {formatExamTime(miniExamTimeRemaining)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                              <XCircle className="w-5 h-5 text-dark-400" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p>
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }}
                            />
                          </div>

                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">
                                {currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}
                              </h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);

                                  return (
                                    <button
                                      key={optIndex}
                                      onClick={() => !isAnswered && handleMiniAnswer(option)}
                                      disabled={isAnswered}
                                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                        isAnswered
                                          ? isCorrect
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : isSelected
                                              ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                                              : 'border-dark-200 dark:border-dark-700 opacity-50'
                                          : isSelected
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                          isAnswered && isCorrect
                                            ? 'bg-green-500 text-white'
                                            : isAnswered && isSelected
                                              ? 'bg-red-400 text-white'
                                              : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300'
                                        }`}>
                                          {String.fromCharCode(65 + optIndex)}
                                        </span>
                                        <span className="text-dark-800 dark:text-dark-200">{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {showMiniRationale && (
                                <div className={`mt-4 p-4 rounded-xl border ${
                                  (selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer))
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    {(selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer)) ? (
                                      <><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>
                                    ) : (
                                      <><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>
                                    )}
                                  </div>
                                  {!(selectedMiniAnswer === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer)) && (
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                      {lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}
                                    </p>
                                  )}
                                  <p className="text-sm text-dark-700 dark:text-dark-300">
                                    <strong>{lang === 'fr' ? 'Explication:' : 'Explanation:'}</strong>{' '}
                                    {miniExamQuestions[currentMiniQuestionIndex].explanation}
                                  </p>
                                </div>
                              )}

                              {showMiniRationale && currentMiniQuestionIndex < miniExamQuestions.length - 1 && (
                                <button
                                  onClick={handleNextMiniQuestion}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Question suivante' : 'Next Question'}
                                </button>
                              )}

                              {showMiniRationale && currentMiniQuestionIndex === miniExamQuestions.length - 1 && (
                                <button
                                  onClick={handleBackToMiniExams}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Terminer l\'examen' : 'Finish Exam'}
                                </button>
                              )}
                            </div>
                          )}

                          {answeredMiniQuestions.size === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary-500" />
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                {miniExamTimedOut
                                  ? (lang === 'fr' ? 'Temps écoulé !' : 'Time\'s up!')
                                  : (lang === 'fr' ? 'Examen terminé !' : 'Exam Complete!')}
                              </h3>
                              {miniExamTimedOut && (
                                <p className="text-dark-600 dark:text-dark-400 mb-2">
                                  {lang === 'fr' ? 'Le temps imparti est écoulé.' : 'The allotted time has expired.'}
                                </p>
                              )}
                              <p className="text-lg text-dark-700 dark:text-dark-300">
                                {lang === 'fr'
                                  ? `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`
                                  : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* CISA Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'cisa' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalCisaMiniExamQuestions} questions réparties sur ${cisaMiniExams.length} mini examens`
                              : `${totalCisaMiniExamQuestions} questions across ${cisaMiniExams.length} mini exams`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {cisaMiniExams.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleSelectMiniExam(exam)}
                              className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'fr' ? exam.nameFr : exam.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                      {exam.questionCount} questions
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4" />
                                      {lang === 'fr' ? 'Démarrer' : 'Start'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}</button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}</span>
                              <button onClick={handleRestartMiniExam} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"><RotateCcw className="w-4 h-4" />{lang === 'fr' ? 'Recommencer' : 'Restart'}</button>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div><h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3><p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p></div></div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}><Timer className="w-5 h-5" />{formatExamTime(miniExamTimeRemaining)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary-500" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p></div></div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3"><XCircle className="w-5 h-5 text-dark-400" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p><p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p></div></div>
                          </div>
                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2"><div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }} /></div>
                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">{currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}</h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);
                                  return (
                                    <button key={optIndex} onClick={() => !isAnswered && handleMiniAnswer(option)} disabled={isAnswered} className={`w-full p-4 rounded-xl text-left transition-all ${isAnswered ? (isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-500 ring-2 ring-green-500/30' : isSelected ? 'bg-red-50 dark:bg-red-900/50 border-red-400 opacity-80' : 'border-dark-200 dark:border-dark-700 opacity-50') : isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-2 ring-primary-500/30' : 'bg-dark-50 dark:bg-dark-800 border-dark-200 dark:border-dark-700 hover:border-primary-500/50'} border`}>
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isAnswered ? (isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-400 text-white' : 'bg-dark-200 dark:bg-dark-700 text-dark-500') : isSelected ? 'bg-primary-500 text-white' : 'bg-dark-200 dark:bg-dark-700 text-dark-500'}`}>{String.fromCharCode(65 + optIndex)}</div>
                                        <span className={`flex-1 ${isAnswered && isCorrect ? 'font-semibold text-green-700 dark:text-green-300' : isAnswered && isSelected && !isCorrect ? 'text-red-600 dark:text-red-300' : ''}`}>{option}</span>
                                        {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              {answeredMiniQuestions.has(currentMiniQuestionIndex) && miniExamQuestions[currentMiniQuestionIndex].explanation && (
                                <div className={`mt-4 p-4 rounded-xl border ${miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                                  <div className="flex items-center gap-2 mb-2">
                                    {miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? (
                                      <><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>
                                    ) : (
                                      <><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>
                                    )}
                                  </div>
                                  {!miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect && (
                                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                      {lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}
                                    </p>
                                  )}
                                  <p className="text-sm text-dark-700 dark:text-dark-300">
                                    <span className="font-semibold">{lang === 'fr' ? 'Explication: ' : 'Explanation: '}</span>
                                    {miniExamQuestions[currentMiniQuestionIndex].explanation}
                                  </p>
                                </div>
                              )}
                              <div className="flex justify-between mt-6">
                                <button onClick={() => { setCurrentMiniQuestionIndex(Math.max(0, currentMiniQuestionIndex - 1)); setSelectedMiniAnswer(null); setShowMiniRationale(false); }} disabled={currentMiniQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Précédent' : 'Previous'}</button>
                                {currentMiniQuestionIndex < miniExamQuestions.length - 1 ? (
                                  <button onClick={() => { setCurrentMiniQuestionIndex(currentMiniQuestionIndex + 1); setSelectedMiniAnswer(null); setShowMiniRationale(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all">{lang === 'fr' ? 'Suivant' : 'Next'}<ArrowRight className="w-4 h-4" /></button>
                                ) : (
                                  <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all"><Trophy className="w-4 h-4" />{lang === 'fr' ? 'Terminer' : 'Finish'}</button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Finance DPro Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'finance-dpro' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalFmdproMiniExamQuestions} questions réparties sur ${fmdproMiniExams.length} mini examen(s)`
                              : `${totalFmdproMiniExamQuestions} questions across ${fmdproMiniExams.length} mini exam(s)`}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fmdproMiniExams.map((exam) => (
                            <button key={exam.id} onClick={() => handleSelectMiniExam(exam)} className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lang === 'fr' ? exam.nameFr : exam.name}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{exam.questionCount} questions</span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4" />{lang === 'fr' ? 'Démarrer' : 'Start'}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}</button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}</span>
                              <button onClick={handleRestartMiniExam} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"><RotateCcw className="w-4 h-4" />{lang === 'fr' ? 'Recommencer' : 'Restart'}</button>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div><h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3><p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p></div></div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}><Timer className="w-5 h-5" />{formatExamTime(miniExamTimeRemaining)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary-500" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p></div></div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3"><XCircle className="w-5 h-5 text-dark-400" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p><p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p></div></div>
                          </div>
                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2"><div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }} /></div>
                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">{currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}</h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);
                                  return (
                                    <button key={optIndex} onClick={() => !isAnswered && handleMiniAnswer(option)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isAnswered ? isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : isSelected ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-dark-200 dark:border-dark-700 opacity-50' : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer'}`}>
                                      <span className={`${isAnswered && isCorrect ? 'text-green-700 dark:text-green-300 font-semibold' : isAnswered && isSelected ? 'text-red-600 dark:text-red-300' : 'text-dark-700 dark:text-dark-300'}`}>{option}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {answeredMiniQuestions.has(currentMiniQuestionIndex) && miniExamQuestions[currentMiniQuestionIndex].explanation && (
                                <div className={`mt-4 p-4 rounded-xl border ${miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}><div className="flex items-center gap-2 mb-2">{miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? (<><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>) : (<><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>)}</div>{!miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect && (<p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">{lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}</p>)}<p className="text-sm text-dark-700 dark:text-dark-300"><span className="font-semibold">{lang === 'fr' ? 'Explication: ' : 'Explanation: '}</span>{miniExamQuestions[currentMiniQuestionIndex].explanation}</p></div>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between">
                            <button onClick={handlePrevMiniQuestion} disabled={currentMiniQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Précédent' : 'Previous'}</button>
                            {currentMiniQuestionIndex < miniExamQuestions.length - 1 ? (
                              <button onClick={handleNextMiniQuestion} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">{lang === 'fr' ? 'Suivant' : 'Next'}<ArrowRight className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"><Trophy className="w-4 h-4" />{lang === 'fr' ? 'Terminer' : 'Finish'}</button>
                            )}
                          </div>
                          {miniExamScore.correct + miniExamScore.incorrect === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center"><Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" /><h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Mini examen terminé !' : 'Mini Exam Complete!'}</h3><p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `Score : ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)` : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}</p></div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Project DPro Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'pm4ngos' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}</h3>
                          <p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `${totalPdproMiniExamQuestions} questions réparties sur ${pdproMiniExams.length} mini examen(s)` : `${totalPdproMiniExamQuestions} questions across ${pdproMiniExams.length} mini exam(s)`}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pdproMiniExams.map((exam) => (
                            <button key={exam.id} onClick={() => handleSelectMiniExam(exam)} className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"><span className="text-white font-bold text-lg">{exam.id}</span></div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lang === 'fr' ? exam.nameFr : exam.name}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{exam.questionCount} questions</span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4" />{lang === 'fr' ? 'Démarrer' : 'Start'}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}</button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}</span>
                              <button onClick={handleRestartMiniExam} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"><RotateCcw className="w-4 h-4" />{lang === 'fr' ? 'Recommencer' : 'Restart'}</button>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div><h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3><p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p></div></div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}><Timer className="w-5 h-5" />{formatExamTime(miniExamTimeRemaining)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary-500" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p></div></div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3"><XCircle className="w-5 h-5 text-dark-400" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p><p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p></div></div>
                          </div>
                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2"><div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }} /></div>
                          {miniExamQuestions[currentMiniQuestionIndex] && (() => {
                            const currentQ = miniExamQuestions[currentMiniQuestionIndex];
                            const isMulti = currentQ.correctAnswers && currentQ.correctAnswers.length > 1;
                            const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                            return (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-2">{currentMiniQuestionIndex + 1}. {currentQ.question}</h4>
                              {isMulti && !isAnswered && (
                                <p className="text-sm text-primary-600 dark:text-primary-400 mb-4 font-medium">{lang === 'fr' ? (currentQ.correctAnswers!.length === currentQ.options.length ? 'Sélectionnez toutes les réponses pertinentes' : `Sélectionnez ${currentQ.correctAnswers!.length} réponses`) : (currentQ.correctAnswers!.length === currentQ.options.length ? 'Select all applicable answers' : `Select ${currentQ.correctAnswers!.length} answers`)}</p>
                              )}
                              <div className="space-y-3">
                                {currentQ.options.map((option, optIndex) => {
                                  const isSelectedSingle = selectedMiniAnswer === option;
                                  const isSelectedMulti = selectedMiniAnswers.includes(option);
                                  const isSelected = isMulti ? isSelectedMulti : isSelectedSingle;
                                  const isCorrect = isMulti
                                    ? currentQ.correctAnswers!.includes(option)
                                    : option === currentQ.correctAnswer || (currentQ.correctAnswer.length === 1 && option.charAt(0) === currentQ.correctAnswer);
                                  return (
                                    <button key={optIndex} onClick={() => !isAnswered && handleMiniAnswer(option)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isAnswered ? isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : isSelected ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-dark-200 dark:border-dark-700 opacity-50' : isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer'}`}>
                                      <div className="flex items-center gap-3">
                                        {isMulti && !isAnswered && (
                                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-300 dark:border-dark-600'}`}>
                                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                          </div>
                                        )}
                                        <span className={`${isAnswered && isCorrect ? 'text-green-700 dark:text-green-300 font-semibold' : isAnswered && isSelected ? 'text-red-600 dark:text-red-300' : 'text-dark-700 dark:text-dark-300'}`}>{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              {isMulti && !isAnswered && selectedMiniAnswers.length > 0 && (
                                <button onClick={handleValidateMultiMiniAnswer} className="mt-4 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                                  {lang === 'fr' ? 'Valider mes réponses' : 'Validate my answers'} ({selectedMiniAnswers.length}/{currentQ.correctAnswers!.length})
                                </button>
                              )}
                              {isAnswered && currentQ.explanation && (
                                <div className={`mt-4 p-4 rounded-xl border ${miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}><div className="flex items-center gap-2 mb-2">{miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? (<><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>) : (<><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>)}</div>{!miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect && (<p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">{lang === 'fr' ? 'Les bonnes réponses sont : ' : 'The correct answers are: '}{isMulti ? currentQ.correctAnswers!.join(' ; ') : currentQ.correctAnswer.replace(/^[A-D]\.\s*/, '')}</p>)}<p className="text-sm text-dark-700 dark:text-dark-300"><span className="font-semibold">{lang === 'fr' ? 'Explication: ' : 'Explanation: '}</span>{currentQ.explanation}</p></div>
                              )}
                            </div>
                            );
                          })()}
                          <div className="flex justify-between">
                            <button onClick={() => { setCurrentMiniQuestionIndex(prev => Math.max(0, prev - 1)); setSelectedMiniAnswer(null); setSelectedMiniAnswers([]); setShowMiniRationale(false); }} disabled={currentMiniQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Précédent' : 'Previous'}</button>
                            {currentMiniQuestionIndex < miniExamQuestions.length - 1 ? (
                              <button onClick={() => { setCurrentMiniQuestionIndex(prev => Math.min(miniExamQuestions.length - 1, prev + 1)); setSelectedMiniAnswer(null); setSelectedMiniAnswers([]); setShowMiniRationale(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">{lang === 'fr' ? 'Suivant' : 'Next'}<ArrowRight className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"><Trophy className="w-4 h-4" />{lang === 'fr' ? 'Terminer' : 'Finish'}</button>
                            )}
                          </div>
                          {miniExamScore.correct + miniExamScore.incorrect === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center"><Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" /><h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Mini examen terminé !' : 'Mini Exam Complete!'}</h3><p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `Score : ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)` : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}</p></div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Social Good DPro Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'social-good-dpro' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}</h3>
                          <p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `${totalSocialgproMiniExamQuestions} questions réparties sur ${socialgproMiniExams.length} mini examen(s)` : `${totalSocialgproMiniExamQuestions} questions across ${socialgproMiniExams.length} mini exam(s)`}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {socialgproMiniExams.map((exam) => (
                            <button key={exam.id} onClick={() => handleSelectMiniExam(exam)} className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"><span className="text-white font-bold text-lg">{exam.id}</span></div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lang === 'fr' ? exam.nameFr : exam.name}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{exam.questionCount} questions</span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4" />{lang === 'fr' ? 'Démarrer' : 'Start'}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}</button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}</span>
                              <button onClick={handleRestartMiniExam} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"><RotateCcw className="w-4 h-4" />{lang === 'fr' ? 'Recommencer' : 'Restart'}</button>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div><h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3><p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p></div></div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}><Timer className="w-5 h-5" />{formatExamTime(miniExamTimeRemaining)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary-500" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p></div></div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3"><XCircle className="w-5 h-5 text-dark-400" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p><p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p></div></div>
                          </div>
                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2"><div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }} /></div>
                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">{currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}</h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);
                                  return (
                                    <button key={optIndex} onClick={() => !isAnswered && handleMiniAnswer(option)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isAnswered ? isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : isSelected ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-dark-200 dark:border-dark-700 opacity-50' : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer'}`}>
                                      <span className={`${isAnswered && isCorrect ? 'text-green-700 dark:text-green-300 font-semibold' : isAnswered && isSelected ? 'text-red-600 dark:text-red-300' : 'text-dark-700 dark:text-dark-300'}`}>{option}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {answeredMiniQuestions.has(currentMiniQuestionIndex) && miniExamQuestions[currentMiniQuestionIndex].explanation && (
                                <div className={`mt-4 p-4 rounded-xl border ${miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}><div className="flex items-center gap-2 mb-2">{miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? (<><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>) : (<><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>)}</div>{!miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect && (<p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">{lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}</p>)}<p className="text-sm text-dark-700 dark:text-dark-300"><span className="font-semibold">{lang === 'fr' ? 'Explication: ' : 'Explanation: '}</span>{miniExamQuestions[currentMiniQuestionIndex].explanation}</p></div>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between">
                            <button onClick={handlePrevMiniQuestion} disabled={currentMiniQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Précédent' : 'Previous'}</button>
                            {currentMiniQuestionIndex < miniExamQuestions.length - 1 ? (
                              <button onClick={handleNextMiniQuestion} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">{lang === 'fr' ? 'Suivant' : 'Next'}<ArrowRight className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"><Trophy className="w-4 h-4" />{lang === 'fr' ? 'Terminer' : 'Finish'}</button>
                            )}
                          </div>
                          {miniExamScore.correct + miniExamScore.incorrect === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center"><Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" /><h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Mini examen terminé !' : 'Mini Exam Complete!'}</h3><p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `Score : ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)` : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}</p></div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* MEAL DPro Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'meal-dpro' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}</h3>
                          <p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `${totalMealdproMiniExamQuestions} questions réparties sur ${mealdproMiniExams.length} mini examen(s)` : `${totalMealdproMiniExamQuestions} questions across ${mealdproMiniExams.length} mini exam(s)`}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {mealdproMiniExams.map((exam) => (
                            <button key={exam.id} onClick={() => handleSelectMiniExam(exam)} className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform"><span className="text-white font-bold text-lg">{exam.id}</span></div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lang === 'fr' ? exam.nameFr : exam.name}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{exam.questionCount} questions</span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4" />{lang === 'fr' ? 'Démarrer' : 'Start'}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}</button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}</span>
                              <button onClick={handleRestartMiniExam} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"><RotateCcw className="w-4 h-4" />{lang === 'fr' ? 'Recommencer' : 'Restart'}</button>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div><h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3><p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p></div></div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}><Timer className="w-5 h-5" />{formatExamTime(miniExamTimeRemaining)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary-500" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p></div></div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3"><XCircle className="w-5 h-5 text-dark-400" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p><p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p></div></div>
                          </div>
                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2"><div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }} /></div>
                          {miniExamQuestions[currentMiniQuestionIndex] && (() => {
                            const currentQ = miniExamQuestions[currentMiniQuestionIndex];
                            const isMulti = currentQ.correctAnswers && currentQ.correctAnswers.length > 1;
                            const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                            return (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-2">{currentMiniQuestionIndex + 1}. {currentQ.question}</h4>
                              {isMulti && !isAnswered && (
                                <p className="text-sm text-primary-600 dark:text-primary-400 mb-4 font-medium">{lang === 'fr' ? (currentQ.correctAnswers!.length === currentQ.options.length ? 'Sélectionnez toutes les réponses pertinentes' : `Sélectionnez ${currentQ.correctAnswers!.length} réponses`) : (currentQ.correctAnswers!.length === currentQ.options.length ? 'Select all applicable answers' : `Select ${currentQ.correctAnswers!.length} answers`)}</p>
                              )}
                              <div className="space-y-3">
                                {currentQ.options.map((option, optIndex) => {
                                  const isSelectedSingle = selectedMiniAnswer === option;
                                  const isSelectedMulti = selectedMiniAnswers.includes(option);
                                  const isSelected = isMulti ? isSelectedMulti : isSelectedSingle;
                                  const isCorrect = isMulti
                                    ? currentQ.correctAnswers!.includes(option)
                                    : option === currentQ.correctAnswer || (currentQ.correctAnswer.length === 1 && option.charAt(0) === currentQ.correctAnswer);
                                  return (
                                    <button key={optIndex} onClick={() => !isAnswered && handleMiniAnswer(option)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isAnswered ? isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : isSelected ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-dark-200 dark:border-dark-700 opacity-50' : isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer'}`}>
                                      <div className="flex items-center gap-3">
                                        {isMulti && !isAnswered && (
                                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-300 dark:border-dark-600'}`}>
                                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                          </div>
                                        )}
                                        <span className={`${isAnswered && isCorrect ? 'text-green-700 dark:text-green-300 font-semibold' : isAnswered && isSelected ? 'text-red-600 dark:text-red-300' : 'text-dark-700 dark:text-dark-300'}`}>{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              {isMulti && !isAnswered && selectedMiniAnswers.length > 0 && (
                                <button onClick={handleValidateMultiMiniAnswer} className="mt-4 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                                  {lang === 'fr' ? 'Valider mes réponses' : 'Validate my answers'} ({selectedMiniAnswers.length}/{currentQ.correctAnswers!.length})
                                </button>
                              )}
                              {isAnswered && currentQ.explanation && (
                                <div className={`mt-4 p-4 rounded-xl border ${miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}><div className="flex items-center gap-2 mb-2">{miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? (<><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>) : (<><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>)}</div>{!miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect && (<p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">{lang === 'fr' ? 'Les bonnes réponses sont : ' : 'The correct answers are: '}{isMulti ? currentQ.correctAnswers!.join(' ; ') : currentQ.correctAnswer.replace(/^[A-D]\.\s*/, '')}</p>)}<p className="text-sm text-dark-700 dark:text-dark-300"><span className="font-semibold">{lang === 'fr' ? 'Explication: ' : 'Explanation: '}</span>{currentQ.explanation}</p></div>
                              )}
                            </div>
                            );
                          })()}
                          <div className="flex justify-between">
                            <button onClick={() => { setCurrentMiniQuestionIndex(prev => Math.max(0, prev - 1)); setSelectedMiniAnswer(null); setSelectedMiniAnswers([]); setShowMiniRationale(false); }} disabled={currentMiniQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Précédent' : 'Previous'}</button>
                            {currentMiniQuestionIndex < miniExamQuestions.length - 1 ? (
                              <button onClick={() => { setCurrentMiniQuestionIndex(prev => Math.min(miniExamQuestions.length - 1, prev + 1)); setSelectedMiniAnswer(null); setSelectedMiniAnswers([]); setShowMiniRationale(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">{lang === 'fr' ? 'Suivant' : 'Next'}<ArrowRight className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"><Trophy className="w-4 h-4" />{lang === 'fr' ? 'Terminer' : 'Finish'}</button>
                            )}
                          </div>
                          {miniExamScore.correct + miniExamScore.incorrect === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center"><Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" /><h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Mini examen terminé !' : 'Mini Exam Complete!'}</h3><p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `Score : ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)` : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}</p></div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Full Exam content for CIA/CFE/PM4NGOs */}
                {activeExamType === 'full' && (() => {
                  const activeFullExamList = certFilter === 'cia-1' ? ciaPart1FullExams
                    : certFilter === 'cia-2' ? ciaPart2FullExams
                    : certFilter === 'cia-3' ? ciaPart3FullExams
                    : isCFE ? cfeFullExams
                    : isCISA ? cisaFullExams
                    : isPM4NGOs ? pdproFullExams
                    : isFinanceDPro ? fmdproFullExams
                    : isSocialGoodDPro ? socialgproFullExams
                    : isMEALDPro ? mealdproFullExams
                    : isProgramDPro ? pgdproFullExams : [];
                  const activeTotalQuestions = certFilter === 'cia-1' ? totalCiaPart1FullExamQuestions
                    : certFilter === 'cia-2' ? totalCiaPart2FullExamQuestions
                    : certFilter === 'cia-3' ? totalCiaPart3FullExamQuestions
                    : isCFE ? totalCfeFullExamQuestions
                    : isCISA ? totalCisaFullExamQuestions
                    : isPM4NGOs ? totalPdproFullExamQuestions
                    : isFinanceDPro ? totalFmdproFullExamQuestions
                    : isSocialGoodDPro ? totalSocialgproFullExamQuestions
                    : isMEALDPro ? totalMealdproFullExamQuestions
                    : isProgramDPro ? totalPgdproFullExamQuestions : 0;
                  return (
                    <div className="space-y-6">
                      {!selectedFullExam ? (
                        <>
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                              {lang === 'fr' ? 'Sélectionnez un examen complet' : 'Select a Full Exam'}
                            </h3>
                            <p className="text-dark-600 dark:text-dark-400">
                              {lang === 'fr'
                                ? `${activeTotalQuestions} questions réparties sur ${activeFullExamList.length} examens complets`
                                : `${activeTotalQuestions} questions across ${activeFullExamList.length} full exams`}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeFullExamList.map((exam) => (
                              <button
                                key={exam.id}
                                onClick={() => handleSelectFullExam(exam)}
                                className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                      {lang === 'fr' ? exam.nameFr : exam.name}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                        {exam.questionCount} questions
                                      </span>
                                      <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-4 h-4" />
                                        {lang === 'fr' ? 'Démarrer' : 'Start'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <button
                                onClick={handleBackToFullExams}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                              >
                                <ArrowLeft className="w-4 h-4" />
                                {lang === 'fr' ? 'Retour aux examens complets' : 'Back to full exams'}
                              </button>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-dark-500 dark:text-dark-400">
                                  {lang === 'fr' ? 'Question' : 'Question'} {currentFullQuestionIndex + 1} / {fullExamQuestions.length}
                                </span>
                                <button
                                  onClick={handleRestartFullExam}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  {lang === 'fr' ? 'Recommencer' : 'Restart'}
                                </button>
                              </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Clock className="w-6 h-6" />
                                  <div>
                                    <h3 className="font-bold">{lang === 'fr' ? selectedFullExam.nameFr : selectedFullExam.name}</h3>
                                    <p className="text-sm opacity-90">{selectedFullExam.questionCount} questions</p>
                                  </div>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${fullExamTimeRemaining < FULL_EXAM_DURATION * 0.1 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}>
                                  <Timer className="w-5 h-5" />
                                  {formatExamTime(fullExamTimeRemaining)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-primary-500" />
                                <div>
                                  <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{fullExamScore.correct}</p>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                                <XCircle className="w-5 h-5 text-dark-400" />
                                <div>
                                  <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                  <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{fullExamScore.incorrect}</p>
                                </div>
                              </div>
                            </div>

                            <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                                style={{ width: `${((currentFullQuestionIndex + 1) / fullExamQuestions.length) * 100}%` }}
                              />
                            </div>

                            {currentFullQuestion && (() => {
                              const multiInfo = getMultiSelectInfo(currentFullQuestion);
                              const isMultiFull = multiInfo.isMulti;
                              const resolvedCorrectAnswers = multiInfo.correctAnswers || [];
                              const expectedCount = resolvedCorrectAnswers.length || (multiInfo as any).expectedCount || 0;
                              return (
                              <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                                <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">
                                  {currentFullQuestion.question}
                                </h3>
                                {isMultiFull && !showFullRationale && expectedCount > 0 && (
                                  <p className="text-sm text-primary-600 dark:text-primary-400 mb-4 font-medium">{lang === 'fr' ? (expectedCount === currentFullQuestion.options.length ? 'Sélectionnez toutes les réponses pertinentes' : `Sélectionnez ${expectedCount} réponses`) : (expectedCount === currentFullQuestion.options.length ? 'Select all applicable answers' : `Select ${expectedCount} answers`)}</p>
                                )}
                                <div className="space-y-3">
                                  {currentFullQuestion.options.map((option, idx) => {
                                    const isSelectedSingle = selectedFullAnswer === option;
                                    const isSelectedMulti = selectedFullAnswers.includes(option);
                                    const isSelected = isMultiFull ? isSelectedMulti : isSelectedSingle;
                                    const isCorrect = isMultiFull
                                      ? resolvedCorrectAnswers.includes(option)
                                      : option === currentFullQuestion.correctAnswer;
                                    const showResult = showFullRationale;
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => !showFullRationale && handleSelectFullAnswer(option)}
                                        disabled={showFullRationale}
                                        className={`w-full p-4 rounded-xl text-left transition-all ${
                                          showResult
                                            ? isCorrect
                                              ? 'bg-primary-500/10 border-2 border-primary-500 text-primary-700 dark:text-primary-300'
                                              : isSelected
                                                ? 'bg-dark-400/10 border-2 border-dark-400 text-dark-600 dark:text-dark-300'
                                                : 'bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 opacity-50'
                                            : isSelected
                                              ? 'bg-primary-500/10 border-2 border-primary-500'
                                              : 'bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50'
                                        }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          {isMultiFull && !showResult && (
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-300 dark:border-dark-600'}`}>
                                              {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                            </div>
                                          )}
                                          <span className="font-medium">{option}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                                {isMultiFull && !showFullRationale && selectedFullAnswers.length > 0 && (
                                  <button onClick={handleValidateMultiFullAnswer} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                                    {lang === 'fr' ? 'Valider mes réponses' : 'Validate my answers'} ({selectedFullAnswers.length}/{expectedCount})
                                  </button>
                                )}
                                {showFullRationale && currentFullQuestion.explanation && (
                                  <div className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                    {!fullExamAnswerMap.get(currentFullQuestionIndex)?.isCorrect && isMultiFull && (
                                      <p className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-2">{lang === 'fr' ? 'Les bonnes réponses sont : ' : 'The correct answers are: '}{resolvedCorrectAnswers.join(' ; ')}</p>
                                    )}
                                    <p className="text-sm text-dark-700 dark:text-dark-300">{currentFullQuestion.explanation}</p>
                                  </div>
                                )}
                                {showFullRationale && currentFullQuestionIndex < fullExamQuestions.length - 1 && (
                                  <button
                                    onClick={handleNextFullQuestion}
                                    className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:shadow-lg transition-all"
                                  >
                                    {lang === 'fr' ? 'Question suivante' : 'Next Question'}
                                  </button>
                                )}
                                {showFullRationale && currentFullQuestionIndex === fullExamQuestions.length - 1 && (
                                  <button
                                    onClick={handleBackToFullExams}
                                    className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:shadow-lg transition-all"
                                  >
                                    {lang === 'fr' ? 'Terminer l\'examen' : 'Finish Exam'}
                                  </button>
                                )}
                              </div>
                              );
                            })()}

                            {answeredFullQuestions.size === fullExamQuestions.length && (
                              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                                <Trophy className="w-12 h-12 mx-auto mb-3 text-primary-500" />
                                {examTimedOut && (
                                  <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-1">
                                    {lang === 'fr' ? 'Temps écoulé !' : 'Time\'s Up!'}
                                  </h3>
                                )}
                                {examTimedOut && (
                                  <p className="text-dark-400 dark:text-dark-400 text-sm mb-2">
                                    {lang === 'fr' ? 'Les questions non répondues ont été marquées comme incorrectes.' : 'Unanswered questions were marked as incorrect.'}
                                  </p>
                                )}
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                  {lang === 'fr'
                                    ? `Score: ${fullExamScore.correct}/${fullExamQuestions.length} (${Math.round((fullExamScore.correct / fullExamQuestions.length) * 100)}%)`
                                    : `Score: ${fullExamScore.correct}/${fullExamQuestions.length} (${Math.round((fullExamScore.correct / fullExamQuestions.length) * 100)}%)`}
                                </h3>
                                <div className="flex gap-3 justify-center mt-4">
                                  <button
                                    onClick={handleRestartFullExam}
                                    className="px-6 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all"
                                  >
                                    {lang === 'fr' ? 'Recommencer' : 'Restart'}
                                  </button>
                                  <button
                                    onClick={handleBackToFullExams}
                                    className="px-6 py-2 rounded-xl bg-dark-200 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-300 dark:hover:bg-dark-600 transition-all"
                                  >
                                    {lang === 'fr' ? 'Autres examens' : 'Other exams'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'exams' && isPL300 && (
              <div className="space-y-6">
                {/* Exam Type Sub-tabs */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveExamType('formulas')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'formulas'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                    {lang === 'fr' ? 'Formules' : 'Formulas'} ({pl300Formulas.length})
                  </button>
                  <button
                    onClick={() => setActiveExamType('domain')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'domain'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    {lang === 'fr' ? 'Examens par domaine' : 'By Domain'}
                  </button>
                  <button
                    onClick={() => setActiveExamType('mini')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'mini'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {lang === 'fr' ? 'Mini examen' : 'Mini Exam'}
                  </button>
                  <button
                    onClick={() => setActiveExamType('full')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'full'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {lang === 'fr' ? 'Examen complet' : 'Full Exam'}
                  </button>
                </div>

                {/* PL-300 Formulas Content */}
                {activeExamType === 'formulas' && (
                  <div className="space-y-6">
                    {/* Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                          </div>
                          <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Maîtrisées' : 'Known'}</p>
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{pl300FormulaScore.known}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-700/10 border border-primary-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-primary-500" />
                          </div>
                          <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'À réviser' : 'Learning'}</p>
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{pl300FormulaScore.learning}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handlePl300FormulaReset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        {lang === 'fr' ? 'Formule' : 'Formula'} {pl300FormulaIndex + 1} / {pl300Formulas.length}
                      </p>
                    </div>

                    {currentPl300Formula && (
                      <div className="max-w-lg mx-auto">
                        <FormulaFlashcard
                          abbreviation={currentPl300Formula.abbreviation}
                          name={currentPl300Formula.name}
                          formula={currentPl300Formula.formula}
                          definition={currentPl300Formula.definition}
                          usage={currentPl300Formula.usage}
                          interpretation={currentPl300Formula.interpretation}
                          isFlipped={isPl300FormulaFlipped}
                          onFlip={() => setIsPl300FormulaFlipped(!isPl300FormulaFlipped)}
                        />
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePrevPl300Formula}
                          disabled={pl300FormulaIndex === 0}
                          className="p-3 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextPl300Formula}
                          disabled={pl300FormulaIndex === pl300Formulas.length - 1}
                          className="p-3 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePl300FormulaLearning}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          <BookText className="w-5 h-5" />
                          {lang === 'fr' ? 'À réviser' : 'Still Learning'}
                        </button>
                        <button
                          onClick={handlePl300FormulaKnown}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {lang === 'fr' ? 'Je connais' : 'I Know This'}
                        </button>
                      </div>
                    </div>

                    {reviewedPl300Formulas.size === pl300Formulas.length && (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-700/10 border border-primary-500/20 text-center">
                        <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                          {lang === 'fr' ? 'Toutes les formules révisées !' : 'All Formulas Reviewed!'}
                        </h3>
                        <p className="text-dark-600 dark:text-dark-400">
                          {lang === 'fr'
                            ? `Félicitations ! Vous avez révisé les ${pl300Formulas.length} formules. Maîtrisées: ${pl300FormulaScore.known}, À réviser: ${pl300FormulaScore.learning}`
                            : `Congratulations! You have reviewed all ${pl300Formulas.length} formulas. Known: ${pl300FormulaScore.known}, Learning: ${pl300FormulaScore.learning}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Program DPro Mini Exams */}
                {activeExamType === 'mini' && certFilter === 'program-dpro' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalPgdproMiniExamQuestions} questions réparties sur ${pgdproMiniExams.length} mini examen(s)`
                              : `${totalPgdproMiniExamQuestions} questions across ${pgdproMiniExams.length} mini exam(s)`}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pgdproMiniExams.map((exam) => (
                            <button key={exam.id} onClick={() => handleSelectMiniExam(exam)} className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lang === 'fr' ? exam.nameFr : exam.name}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{exam.questionCount} questions</span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4" />{lang === 'fr' ? 'Démarrer' : 'Start'}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}</button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}</span>
                              <button onClick={handleRestartMiniExam} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"><RotateCcw className="w-4 h-4" />{lang === 'fr' ? 'Recommencer' : 'Restart'}</button>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div><h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3><p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p></div></div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}><Timer className="w-5 h-5" />{formatExamTime(miniExamTimeRemaining)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary-500" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p></div></div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3"><XCircle className="w-5 h-5 text-dark-400" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p><p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p></div></div>
                          </div>
                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2"><div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }} /></div>
                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">{currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}</h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);
                                  return (
                                    <button key={optIndex} onClick={() => !isAnswered && handleMiniAnswer(option)} disabled={isAnswered} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isAnswered ? isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : isSelected ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-dark-200 dark:border-dark-700 opacity-50' : 'border-dark-200 dark:border-dark-700 hover:border-primary-500/50 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer'}`}>
                                      <span className={`${isAnswered && isCorrect ? 'text-green-700 dark:text-green-300 font-semibold' : isAnswered && isSelected ? 'text-red-600 dark:text-red-300' : 'text-dark-700 dark:text-dark-300'}`}>{option}</span>
                                    </button>
                                  );
                                })}
                              </div>
                              {answeredMiniQuestions.has(currentMiniQuestionIndex) && miniExamQuestions[currentMiniQuestionIndex].explanation && (
                                <div className={`mt-4 p-4 rounded-xl border ${miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}><div className="flex items-center gap-2 mb-2">{miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? (<><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>) : (<><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>)}</div>{!miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect && (<p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">{lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}</p>)}<p className="text-sm text-dark-700 dark:text-dark-300"><span className="font-semibold">{lang === 'fr' ? 'Explication: ' : 'Explanation: '}</span>{miniExamQuestions[currentMiniQuestionIndex].explanation}</p></div>
                              )}
                            </div>
                          )}
                          <div className="flex justify-between">
                            <button onClick={handlePrevMiniQuestion} disabled={currentMiniQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Précédent' : 'Previous'}</button>
                            {currentMiniQuestionIndex < miniExamQuestions.length - 1 ? (
                              <button onClick={handleNextMiniQuestion} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">{lang === 'fr' ? 'Suivant' : 'Next'}<ArrowRight className="w-4 h-4" /></button>
                            ) : (
                              <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"><Trophy className="w-4 h-4" />{lang === 'fr' ? 'Terminer' : 'Finish'}</button>
                            )}
                          </div>
                          {miniExamScore.correct + miniExamScore.incorrect === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center"><Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" /><h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">{lang === 'fr' ? 'Mini examen terminé !' : 'Mini Exam Complete!'}</h3><p className="text-dark-600 dark:text-dark-400">{lang === 'fr' ? `Score : ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)` : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}</p></div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* PL-300 Mini Exams */}
                {activeExamType === 'mini' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalPl300MiniExamQuestions} questions réparties sur ${pl300MiniExams.length} mini examen(s)`
                              : `${totalPl300MiniExamQuestions} questions across ${pl300MiniExams.length} mini exam(s)`}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pl300MiniExams.map((exam) => (
                            <button key={exam.id} onClick={() => handleSelectMiniExam(exam)} className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{lang === 'fr' ? exam.nameFr : exam.name}</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">{exam.questionCount} questions</span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-4 h-4" />{lang === 'fr' ? 'Démarrer' : 'Start'}</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}</button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}</span>
                              <button onClick={handleRestartMiniExam} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"><RotateCcw className="w-4 h-4" />{lang === 'fr' ? 'Recommencer' : 'Restart'}</button>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3"><Zap className="w-6 h-6" /><div><h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3><p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p></div></div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}><Timer className="w-5 h-5" />{formatExamTime(miniExamTimeRemaining)}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3"><CheckCircle className="w-5 h-5 text-primary-500" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p><p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p></div></div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3"><XCircle className="w-5 h-5 text-dark-400" /><div><p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p><p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p></div></div>
                          </div>
                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2"><div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }} /></div>
                          {miniExamQuestions[currentMiniQuestionIndex] && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-4">{currentMiniQuestionIndex + 1}. {miniExamQuestions[currentMiniQuestionIndex].question}</h4>
                              <div className="space-y-3">
                                {miniExamQuestions[currentMiniQuestionIndex].options.map((option, optIndex) => {
                                  const isAnswered = answeredMiniQuestions.has(currentMiniQuestionIndex);
                                  const isSelected = selectedMiniAnswer === optIndex;
                                  const isCorrect = option === miniExamQuestions[currentMiniQuestionIndex].correctAnswer || (miniExamQuestions[currentMiniQuestionIndex].correctAnswer.length === 1 && option.charAt(0) === miniExamQuestions[currentMiniQuestionIndex].correctAnswer);
                                  return (
                                    <button key={optIndex} onClick={() => !isAnswered && setSelectedMiniAnswer(optIndex)} disabled={isAnswered} className={`w-full p-4 rounded-xl text-left transition-all ${isAnswered ? (isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-500 ring-2 ring-green-500/30' : isSelected ? 'bg-red-50 dark:bg-red-900/50 border-red-400 opacity-80' : 'border-dark-200 dark:border-dark-700 opacity-50') : isSelected ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-2 ring-primary-500/30' : 'bg-dark-50 dark:bg-dark-800 border-dark-200 dark:border-dark-700 hover:border-primary-500/50'} border`}>
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isAnswered ? (isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-400 text-white' : 'bg-dark-200 dark:bg-dark-700 text-dark-500') : isSelected ? 'bg-primary-500 text-white' : 'bg-dark-200 dark:bg-dark-700 text-dark-500'}`}>{String.fromCharCode(65 + optIndex)}</div>
                                        <span className={`flex-1 ${isAnswered && isCorrect ? 'font-semibold text-green-700 dark:text-green-300' : isAnswered && isSelected && !isCorrect ? 'text-red-600 dark:text-red-300' : ''}`}>{option}</span>
                                        {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              {answeredMiniQuestions.has(currentMiniQuestionIndex) && miniExamQuestions[currentMiniQuestionIndex].explanation && (
                                <div className={`mt-4 p-4 rounded-xl border ${miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}><div className="flex items-center gap-2 mb-2">{miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect ? (<><CheckCircle className="w-5 h-5 text-green-500" /><span className="font-semibold text-green-700 dark:text-green-400">{lang === 'fr' ? 'Bonne réponse !' : 'Correct!'}</span></>) : (<><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700 dark:text-red-400">{lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect'}</span></>)}</div>{!miniExamAnswerMap.get(currentMiniQuestionIndex)?.isCorrect && (<p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">{lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{miniExamQuestions[currentMiniQuestionIndex].correctAnswer.replace(/^[A-D]\.\s*/, '')}</p>)}<p className="text-sm text-dark-700 dark:text-dark-300"><span className="font-semibold">{lang === 'fr' ? 'Explication: ' : 'Explanation: '}</span>{miniExamQuestions[currentMiniQuestionIndex].explanation}</p></div>
                              )}
                              <div className="flex justify-between mt-6">
                                <button onClick={() => { setCurrentMiniQuestionIndex(Math.max(0, currentMiniQuestionIndex - 1)); setSelectedMiniAnswer(null); setShowMiniRationale(false); }} disabled={currentMiniQuestionIndex === 0} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 disabled:opacity-50 transition-all"><ArrowLeft className="w-4 h-4" />{lang === 'fr' ? 'Précédent' : 'Previous'}</button>
                                {!answeredMiniQuestions.has(currentMiniQuestionIndex) ? (
                                  <button onClick={() => { if (selectedMiniAnswer !== null) { const option = miniExamQuestions[currentMiniQuestionIndex].options[selectedMiniAnswer as number]; handleSelectMiniAnswer(option); } }} disabled={selectedMiniAnswer === null} className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl">{lang === 'fr' ? 'Valider' : 'Submit'}</button>
                                ) : currentMiniQuestionIndex < miniExamQuestions.length - 1 ? (
                                  <button onClick={() => { setCurrentMiniQuestionIndex(currentMiniQuestionIndex + 1); setSelectedMiniAnswer(null); setShowMiniRationale(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all">{lang === 'fr' ? 'Suivant' : 'Next'}<ArrowRight className="w-4 h-4" /></button>
                                ) : (
                                  <button onClick={handleBackToMiniExams} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium hover:from-primary-600 hover:to-primary-700 transition-all"><Trophy className="w-4 h-4" />{lang === 'fr' ? 'Terminer' : 'Finish'}</button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* PL-300 Full Exam content */}
                {activeExamType === 'full' && (
                  <div className="space-y-6">
                    {!selectedFullExam ? (
                      <>
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un examen complet' : 'Select a Full Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalPl300FullExamQuestions} questions réparties sur ${pl300FullExams.length} examens complets`
                              : `${totalPl300FullExamQuestions} questions across ${pl300FullExams.length} full exams`}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pl300FullExams.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleSelectFullExam(exam)}
                              className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'fr' ? exam.nameFr : exam.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                      {exam.questionCount} questions
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4" />
                                      {lang === 'fr' ? 'Démarrer' : 'Start'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button
                              onClick={handleBackToFullExams}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {lang === 'fr' ? 'Retour aux examens complets' : 'Back to full exams'}
                            </button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                {lang === 'fr' ? 'Question' : 'Question'} {currentFullQuestionIndex + 1} / {fullExamQuestions.length}
                              </span>
                              <button
                                onClick={handleRestartFullExam}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {lang === 'fr' ? 'Recommencer' : 'Restart'}
                              </button>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6" />
                                <div>
                                  <h3 className="font-bold">{lang === 'fr' ? selectedFullExam.nameFr : selectedFullExam.name}</h3>
                                  <p className="text-sm opacity-90">{selectedFullExam.questionCount} questions</p>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${fullExamTimeRemaining < FULL_EXAM_DURATION * 0.1 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}>
                                <Timer className="w-5 h-5" />
                                {formatExamTime(fullExamTimeRemaining)}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{fullExamScore.correct}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                              <XCircle className="w-5 h-5 text-dark-400" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{fullExamScore.incorrect}</p>
                              </div>
                            </div>
                          </div>

                          <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-700 h-2 rounded-full transition-all"
                              style={{ width: `${((currentFullQuestionIndex + 1) / fullExamQuestions.length) * 100}%` }}
                            />
                          </div>

                          {currentFullQuestion && (() => {
                            const multiInfo = getMultiSelectInfo(currentFullQuestion);
                            const isMultiFull = multiInfo.isMulti;
                            const resolvedCorrectAnswers = multiInfo.correctAnswers || [];
                            const expectedCount = resolvedCorrectAnswers.length || (multiInfo as any).expectedCount || 0;
                            return (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">
                                {currentFullQuestion.question}
                              </h3>
                              {isMultiFull && !showFullRationale && expectedCount > 0 && (
                                <p className="text-sm text-primary-600 dark:text-primary-400 mb-4 font-medium">{lang === 'fr' ? (expectedCount === currentFullQuestion.options.length ? 'Sélectionnez toutes les réponses pertinentes' : `Sélectionnez ${expectedCount} réponses`) : (expectedCount === currentFullQuestion.options.length ? 'Select all applicable answers' : `Select ${expectedCount} answers`)}</p>
                              )}
                              <div className="space-y-3">
                                {currentFullQuestion.options.map((option, idx) => {
                                  const isSelectedSingle = selectedFullAnswer === option;
                                  const isSelectedMulti = selectedFullAnswers.includes(option);
                                  const isSelected = isMultiFull ? isSelectedMulti : isSelectedSingle;
                                  const isCorrect = isMultiFull
                                    ? resolvedCorrectAnswers.includes(option)
                                    : option === currentFullQuestion.correctAnswer;
                                  const showResult = showFullRationale;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => !showFullRationale && handleSelectFullAnswer(option)}
                                      disabled={showFullRationale}
                                      className={`w-full p-4 rounded-xl text-left transition-all ${
                                        showResult
                                          ? isCorrect
                                            ? 'bg-primary-500/10 border-2 border-primary-500 text-primary-700 dark:text-primary-300'
                                            : isSelected
                                              ? 'bg-dark-400/10 border-2 border-dark-400 text-dark-600 dark:text-dark-300'
                                              : 'bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 opacity-50'
                                          : isSelected
                                            ? 'bg-primary-500/10 border-2 border-primary-500'
                                            : 'bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {isMultiFull && !showResult && (
                                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-dark-300 dark:border-dark-600'}`}>
                                            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                                          </div>
                                        )}
                                        <span className="font-medium">{option}</span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              {isMultiFull && !showFullRationale && selectedFullAnswers.length > 0 && (
                                <button onClick={handleValidateMultiFullAnswer} className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
                                  {lang === 'fr' ? 'Valider mes réponses' : 'Validate my answers'} ({selectedFullAnswers.length}/{expectedCount})
                                </button>
                              )}
                              {showFullRationale && currentFullQuestion.explanation && (
                                <div className="mt-4 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                  {!fullExamAnswerMap.get(currentFullQuestionIndex)?.isCorrect && isMultiFull && (
                                    <p className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-2">{lang === 'fr' ? 'Les bonnes réponses sont : ' : 'The correct answers are: '}{resolvedCorrectAnswers.join(' ; ')}</p>
                                  )}
                                  <p className="text-sm text-dark-700 dark:text-dark-300">{currentFullQuestion.explanation}</p>
                                </div>
                              )}
                              {showFullRationale && currentFullQuestionIndex < fullExamQuestions.length - 1 && (
                                <button
                                  onClick={handleNextFullQuestion}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Question suivante' : 'Next Question'}
                                </button>
                              )}
                              {showFullRationale && currentFullQuestionIndex === fullExamQuestions.length - 1 && (
                                <button
                                  onClick={handleBackToFullExams}
                                  className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-medium hover:shadow-lg transition-all"
                                >
                                  {lang === 'fr' ? 'Terminer l\'examen' : 'Finish Exam'}
                                </button>
                              )}
                            </div>
                          );
                          })()}

                          {answeredFullQuestions.size === fullExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-700/10 border border-primary-500/20 text-center">
                              <Trophy className="w-12 h-12 mx-auto mb-3 text-primary-500" />
                              {examTimedOut && (
                                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-1">
                                  {lang === 'fr' ? 'Temps écoulé !' : 'Time\'s Up!'}
                                </h3>
                              )}
                              {examTimedOut && (
                                <p className="text-dark-400 dark:text-dark-400 text-sm mb-2">
                                  {lang === 'fr' ? 'Les questions non répondues ont été marquées comme incorrectes.' : 'Unanswered questions were marked as incorrect.'}
                                </p>
                              )}
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                {lang === 'fr'
                                  ? `Score: ${fullExamScore.correct}/${fullExamQuestions.length} (${Math.round((fullExamScore.correct / fullExamQuestions.length) * 100)}%)`
                                  : `Score: ${fullExamScore.correct}/${fullExamQuestions.length} (${Math.round((fullExamScore.correct / fullExamQuestions.length) * 100)}%)`}
                              </h3>
                              <div className="flex gap-3 justify-center mt-4">
                                <button
                                  onClick={handleRestartFullExam}
                                  className="px-6 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all"
                                >
                                  {lang === 'fr' ? 'Recommencer' : 'Restart'}
                                </button>
                                <button
                                  onClick={handleBackToFullExams}
                                  className="px-6 py-2 rounded-xl bg-dark-200 dark:bg-dark-700 text-dark-700 dark:text-dark-300 hover:bg-dark-300 dark:hover:bg-dark-600 transition-all"
                                >
                                  {lang === 'fr' ? 'Autres examens' : 'Other exams'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'exams' && isPMP && (
              <div className="space-y-6">
                {/* Exam Type Sub-tabs */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveExamType('formulas')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'formulas'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-800 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                    {lang === 'fr' ? 'Formules' : 'Formulas'} ({formulas.length})
                  </button>
                  <button
                    onClick={() => setActiveExamType('domain')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'domain'
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    {lang === 'fr' ? 'Examens par domaine' : 'By Domain'}
                  </button>
                  <button
                    onClick={() => setActiveExamType('mini')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'mini'
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    {lang === 'fr' ? 'Mini examen (50 questions)' : 'Mini Exam (50 questions)'}
                  </button>
                  <button
                    onClick={() => setActiveExamType('full')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      activeExamType === 'full'
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg'
                        : 'bg-white dark:bg-dark-800 text-dark-600 dark:text-dark-300 border border-dark-200 dark:border-dark-700 hover:shadow-md'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    {lang === 'fr' ? 'Examen complet (4h)' : 'Full Exam (4h)'}
                  </button>
                </div>

                {/* Formulas Content */}
                {activeExamType === 'formulas' && (
                  <div className="space-y-6">
                    {/* Score Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Known */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-primary-500" />
                          </div>
                          <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Maîtrisées' : 'Known'}</p>
                            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{formulaScore.known}</p>
                          </div>
                        </div>
                      </div>

                      {/* Learning */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary-600/10 to-primary-800/10 border border-primary-600/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'À réviser' : 'Learning'}</p>
                            <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{formulaScore.learning}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={handleFormulaReset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {lang === 'fr' ? 'Réinitialiser' : 'Reset'}
                      </button>
                    </div>

                    {/* Card Counter */}
                    <div className="text-center">
                      <p className="text-sm text-dark-500 dark:text-dark-400">
                        {lang === 'fr' ? 'Formule' : 'Formula'} {currentFormulaIndex + 1} / {formulas.length}
                      </p>
                    </div>

                    {/* Formula Flashcard */}
                    {currentFormula && (
                      <div className="max-w-lg mx-auto">
                        <FormulaFlashcard
                          abbreviation={currentFormula.abbreviation}
                          name={currentFormula.name}
                          formula={currentFormula.formula}
                          definition={currentFormula.definition}
                          usage={currentFormula.usage}
                          interpretation={currentFormula.interpretation}
                          isFlipped={isFormulaFlipped}
                          onFlip={() => setIsFormulaFlipped(!isFormulaFlipped)}
                        />
                      </div>
                    )}

                    {/* Navigation & Action Buttons */}
                    <div className="flex flex-col items-center gap-4">
                      {/* Navigation */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handlePrevFormula}
                          disabled={currentFormulaIndex === 0}
                          className="p-3 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextFormula}
                          disabled={currentFormulaIndex === formulas.length - 1}
                          className="p-3 rounded-full bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={handleFormulaLearning}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          <BookText className="w-5 h-5" />
                          {lang === 'fr' ? 'À réviser' : 'Still Learning'}
                        </button>
                        <button
                          onClick={handleFormulaKnown}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {lang === 'fr' ? 'Je connais' : 'I Know This'}
                        </button>
                      </div>
                    </div>

                    {/* All Formulas Reviewed */}
                    {reviewedFormulas.size === formulas.length && (
                      <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-600/10 to-primary-800/10 border border-primary-600/20 text-center">
                        <Trophy className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                          {lang === 'fr' ? 'Toutes les formules révisées !' : 'All Formulas Reviewed!'}
                        </h3>
                        <p className="text-dark-600 dark:text-dark-400">
                          {lang === 'fr'
                            ? `Félicitations ! Vous avez révisé les ${formulas.length} formules. Maîtrisées: ${formulaScore.known}, À réviser: ${formulaScore.learning}`
                            : `Congratulations! You have reviewed all ${formulas.length} formulas. Known: ${formulaScore.known}, Learning: ${formulaScore.learning}`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Exam Content based on sub-tab */}
                {activeExamType === 'domain' && (
                  <div className="space-y-6">
                    {!selectedDomain ? (
                      <>
                        {/* Domain Selection */}
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un domaine' : 'Select a Domain'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${pmpDomains.reduce((sum, d) => sum + d.questionCount, 0)} questions réparties sur ${pmpDomains.length} domaines`
                              : `${pmpDomains.reduce((sum, d) => sum + d.questionCount, 0)} questions across ${pmpDomains.length} domains`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pmpDomains.map((domain) => {
                            const DomainIcon = domainIconMap[domain.icon] || Target;
                            return (
                              <button
                                key={domain.id}
                                onClick={() => handleSelectDomain(domain)}
                                className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                              >
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${domain.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <DomainIcon className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                      {lang === 'fr' ? domain.nameFr : domain.name}
                                    </h4>
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-3 line-clamp-2">
                                      {lang === 'fr' ? domain.descriptionFr : domain.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                        {domain.questionCount} questions
                                      </span>
                                      <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Play className="w-4 h-4" />
                                        {lang === 'fr' ? 'Démarrer' : 'Start'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Domain Exam Mode */}
                        <div className="space-y-6">
                          {/* Header with back button and progress */}
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button
                              onClick={handleBackToDomains}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {lang === 'fr' ? 'Retour aux domaines' : 'Back to domains'}
                            </button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                {lang === 'fr' ? 'Question' : 'Question'} {currentQuestionIndex + 1} / {domainQuestions.length}
                              </span>
                              <button
                                onClick={handleRestartDomainExam}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {lang === 'fr' ? 'Recommencer' : 'Restart'}
                              </button>
                            </div>
                          </div>

                          {/* Domain info */}
                          <div className={`p-4 rounded-xl bg-gradient-to-r ${selectedDomain.color} text-white`}>
                            <div className="flex items-center gap-3">
                              {(() => {
                                const DomainIcon = domainIconMap[selectedDomain.icon] || Target;
                                return <DomainIcon className="w-6 h-6" />;
                              })()}
                              <div>
                                <h3 className="font-bold">{lang === 'fr' ? selectedDomain.nameFr : selectedDomain.name}</h3>
                                <p className="text-sm opacity-90">{lang === 'fr' ? selectedDomain.descriptionFr : selectedDomain.description}</p>
                              </div>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{domainExamScore.correct}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                              <XCircle className="w-5 h-5 text-dark-400" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{domainExamScore.incorrect}</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                              style={{ width: `${((currentQuestionIndex + 1) / domainQuestions.length) * 100}%` }}
                            />
                          </div>

                          {/* Question */}
                          {currentDomainQuestion && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <p className="text-lg font-medium text-dark-900 dark:text-white mb-6 leading-relaxed">
                                {currentDomainQuestion.question}
                              </p>

                              {/* Options */}
                              <div className="space-y-3">
                                {currentDomainQuestion.options.map((option: string, index: number) => {
                                  const isSelected = selectedAnswer === option;
                                  const isCorrect = option === currentDomainQuestion.correct;
                                  const showResult = showRationale;

                                  let optionClass = "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3";

                                  if (showResult) {
                                    if (isCorrect) {
                                      optionClass += " border-primary-500 bg-primary-50 dark:bg-primary-900/20";
                                    } else if (isSelected && !isCorrect) {
                                      optionClass += " border-dark-400 bg-dark-100 dark:bg-dark-800/20";
                                    } else {
                                      optionClass += " border-dark-200 dark:border-dark-600 opacity-50";
                                    }
                                  } else {
                                    optionClass += isSelected
                                      ? " border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                      : " border-dark-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10";
                                  }

                                  return (
                                    <button
                                      key={index}
                                      onClick={() => handleSelectAnswer(option)}
                                      disabled={showRationale}
                                      className={optionClass}
                                    >
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                                        showResult && isCorrect
                                          ? 'bg-primary-500 text-white'
                                          : showResult && isSelected && !isCorrect
                                          ? 'bg-dark-400 text-white'
                                          : isSelected
                                          ? 'bg-primary-500 text-white'
                                          : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300'
                                      }`}>
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <span className={`text-left ${
                                        showResult && isCorrect
                                          ? 'text-primary-700 dark:text-primary-300 font-medium'
                                          : showResult && isSelected && !isCorrect
                                          ? 'text-dark-600 dark:text-dark-300'
                                          : 'text-dark-700 dark:text-dark-300'
                                      }`}>
                                        {option}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Rationale */}
                              {showRationale && (
                                <div className={`mt-6 p-4 rounded-xl ${
                                  selectedAnswer === currentDomainQuestion.correct
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                    : 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    {selectedAnswer === currentDomainQuestion.correct ? (
                                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <AlertTriangle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                      <p className={`font-semibold mb-1 ${
                                        selectedAnswer === currentDomainQuestion.correct
                                          ? 'text-primary-700 dark:text-primary-300'
                                          : 'text-primary-700 dark:text-primary-300'
                                      }`}>
                                        {selectedAnswer === currentDomainQuestion.correct
                                          ? (lang === 'fr' ? 'Correct !' : 'Correct!')
                                          : (lang === 'fr' ? 'Incorrect' : 'Incorrect')}
                                      </p>
                                      <p className="text-dark-600 dark:text-dark-400 text-sm">
                                        {currentDomainQuestion.rationale}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Navigation */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handlePrevQuestion}
                              disabled={currentQuestionIndex === 0}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                              {lang === 'fr' ? 'Précédent' : 'Previous'}
                            </button>

                            {showRationale && currentQuestionIndex < domainQuestions.length - 1 && (
                              <button
                                onClick={handleNextQuestion}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary-400 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                {lang === 'fr' ? 'Suivant' : 'Next'}
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            )}

                            {showRationale && currentQuestionIndex === domainQuestions.length - 1 && (
                              <button
                                onClick={handleBackToDomains}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                <Trophy className="w-5 h-5" />
                                {lang === 'fr' ? 'Terminer' : 'Finish'}
                              </button>
                            )}
                          </div>

                          {/* Completion message */}
                          {answeredQuestions.size === domainQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                              <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                {lang === 'fr' ? 'Examen terminé !' : 'Exam Complete!'}
                              </h3>
                              <p className="text-dark-600 dark:text-dark-400 mb-2">
                                {lang === 'fr'
                                  ? `Score: ${domainExamScore.correct}/${domainQuestions.length} (${Math.round((domainExamScore.correct / domainQuestions.length) * 100)}%)`
                                  : `Score: ${domainExamScore.correct}/${domainQuestions.length} (${Math.round((domainExamScore.correct / domainQuestions.length) * 100)}%)`}
                              </p>
                              <div className="flex justify-center gap-3 mt-4">
                                <button
                                  onClick={handleRestartDomainExam}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-all"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  {lang === 'fr' ? 'Recommencer' : 'Restart'}
                                </button>
                                <button
                                  onClick={handleBackToDomains}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 font-medium hover:bg-dark-200 dark:hover:bg-dark-600 transition-all"
                                >
                                  {lang === 'fr' ? 'Autre domaine' : 'Other domain'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeExamType === 'mini' && (
                  <div className="space-y-6">
                    {!selectedMiniExam ? (
                      <>
                        {/* Mini Exam Selection */}
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un mini examen' : 'Select a Mini Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalMiniExamQuestions} questions réparties sur ${pmpMiniExams.length} mini examens`
                              : `${totalMiniExamQuestions} questions across ${pmpMiniExams.length} mini exams`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {pmpMiniExams.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleSelectMiniExam(exam)}
                              className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-white font-bold text-lg">{exam.id}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'fr' ? exam.nameFr : exam.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                      {exam.questionCount} questions
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4" />
                                      {lang === 'fr' ? 'Démarrer' : 'Start'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Mini Exam Mode */}
                        <div className="space-y-6">
                          {/* Header with back button and progress */}
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button
                              onClick={handleBackToMiniExams}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {lang === 'fr' ? 'Retour aux mini examens' : 'Back to mini exams'}
                            </button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                {lang === 'fr' ? 'Question' : 'Question'} {currentMiniQuestionIndex + 1} / {miniExamQuestions.length}
                              </span>
                              <button
                                onClick={handleRestartMiniExam}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {lang === 'fr' ? 'Recommencer' : 'Restart'}
                              </button>
                            </div>
                          </div>

                          {/* Mini Exam info */}
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-400 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6" />
                                <div>
                                  <h3 className="font-bold">{lang === 'fr' ? selectedMiniExam.nameFr : selectedMiniExam.name}</h3>
                                  <p className="text-sm opacity-90">{selectedMiniExam.questionCount} questions</p>
                                </div>
                              </div>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${miniExamTimeRemaining < MINI_EXAM_DURATION * 0.2 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}>
                                <Timer className="w-5 h-5" />
                                {formatExamTime(miniExamTimeRemaining)}
                              </div>
                            </div>
                          </div>

                          {/* Score */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{miniExamScore.correct}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                              <XCircle className="w-5 h-5 text-dark-400" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{miniExamScore.incorrect}</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                              style={{ width: `${((currentMiniQuestionIndex + 1) / miniExamQuestions.length) * 100}%` }}
                            />
                          </div>

                          {/* Question */}
                          {currentMiniQuestion && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <p className="text-lg font-medium text-dark-900 dark:text-white mb-6 leading-relaxed">
                                {currentMiniQuestion.question}
                              </p>

                              {/* Options */}
                              <div className="space-y-3">
                                {currentMiniQuestion.options.map((option: string, index: number) => {
                                  const isSelected = selectedMiniAnswer === option;
                                  const isCorrect = option === currentMiniQuestion.correctAnswer || (currentMiniQuestion.correctAnswer.length === 1 && option.charAt(0) === currentMiniQuestion.correctAnswer);
                                  const showResult = showMiniRationale;

                                  let optionClass = "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 w-full text-left";

                                  if (showResult) {
                                    if (isCorrect) {
                                      optionClass += " border-green-500 bg-green-50 dark:bg-green-900/20";
                                    } else if (isSelected && !isCorrect) {
                                      optionClass += " border-red-400 bg-red-50 dark:bg-red-900/20";
                                    } else {
                                      optionClass += " border-dark-200 dark:border-dark-600 opacity-50";
                                    }
                                  } else {
                                    optionClass += isSelected
                                      ? " border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                      : " border-dark-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10";
                                  }

                                  return (
                                    <button
                                      key={index}
                                      onClick={() => handleSelectMiniAnswer(option)}
                                      disabled={showMiniRationale}
                                      className={optionClass}
                                    >
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                                        showResult && isCorrect
                                          ? 'bg-green-500 text-white'
                                          : showResult && isSelected && !isCorrect
                                          ? 'bg-red-400 text-white'
                                          : isSelected
                                          ? 'bg-primary-500 text-white'
                                          : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300'
                                      }`}>
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <span className={`text-left ${
                                        showResult && isCorrect
                                          ? 'text-green-700 dark:text-green-300 font-medium'
                                          : showResult && isSelected && !isCorrect
                                          ? 'text-red-600 dark:text-red-300'
                                          : 'text-dark-700 dark:text-dark-300'
                                      }`}>
                                        {option.replace(/^[A-D]\.\s*/, '')}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Rationale */}
                              {showMiniRationale && (() => {
                                const isMiniCorrect = selectedMiniAnswer === currentMiniQuestion.correctAnswer || (currentMiniQuestion.correctAnswer.length === 1 && selectedMiniAnswer?.charAt(0) === currentMiniQuestion.correctAnswer);
                                return (
                                <div className={`mt-6 p-4 rounded-xl border ${
                                  isMiniCorrect
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    {isMiniCorrect ? (
                                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                      <p className={`font-semibold mb-1 ${
                                        isMiniCorrect
                                          ? 'text-green-700 dark:text-green-400'
                                          : 'text-red-700 dark:text-red-400'
                                      }`}>
                                        {isMiniCorrect
                                          ? (lang === 'fr' ? 'Bonne réponse !' : 'Correct!')
                                          : (lang === 'fr' ? 'Mauvaise réponse' : 'Incorrect')}
                                      </p>
                                      {!isMiniCorrect && (
                                        <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                                          {lang === 'fr' ? 'La bonne réponse est : ' : 'The correct answer is: '}{currentMiniQuestion.correctAnswer.replace(/^[A-D]\.\s*/, '')}
                                        </p>
                                      )}
                                      <p className="text-dark-600 dark:text-dark-400 text-sm">
                                        {currentMiniQuestion.explanation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* Navigation */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handlePrevMiniQuestion}
                              disabled={currentMiniQuestionIndex === 0}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                              {lang === 'fr' ? 'Précédent' : 'Previous'}
                            </button>

                            {showMiniRationale && currentMiniQuestionIndex < miniExamQuestions.length - 1 && (
                              <button
                                onClick={handleNextMiniQuestion}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary-400 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                {lang === 'fr' ? 'Suivant' : 'Next'}
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            )}

                            {showMiniRationale && currentMiniQuestionIndex === miniExamQuestions.length - 1 && (
                              <button
                                onClick={handleBackToMiniExams}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                <Trophy className="w-5 h-5" />
                                {lang === 'fr' ? 'Terminer' : 'Finish'}
                              </button>
                            )}
                          </div>

                          {/* Completion message */}
                          {answeredMiniQuestions.size === miniExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                              <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                {miniExamTimedOut
                                  ? (lang === 'fr' ? 'Temps écoulé !' : 'Time\'s Up!')
                                  : (lang === 'fr' ? 'Mini examen terminé !' : 'Mini Exam Complete!')}
                              </h3>
                              {miniExamTimedOut && (
                                <p className="text-dark-400 dark:text-dark-400 text-sm mb-2">
                                  {lang === 'fr' ? 'Les questions non répondues ont été marquées comme incorrectes.' : 'Unanswered questions were marked as incorrect.'}
                                </p>
                              )}
                              <p className="text-dark-600 dark:text-dark-400 mb-2">
                                {lang === 'fr'
                                  ? `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`
                                  : `Score: ${miniExamScore.correct}/${miniExamQuestions.length} (${Math.round((miniExamScore.correct / miniExamQuestions.length) * 100)}%)`}
                              </p>
                              <div className="flex justify-center gap-3 mt-4">
                                <button
                                  onClick={handleRestartMiniExam}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-all"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  {lang === 'fr' ? 'Recommencer' : 'Restart'}
                                </button>
                                <button
                                  onClick={handleBackToMiniExams}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 font-medium hover:bg-dark-200 dark:hover:bg-dark-600 transition-all"
                                >
                                  {lang === 'fr' ? 'Autre mini examen' : 'Other mini exam'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeExamType === 'full' && (
                  <div className="space-y-6">
                    {!selectedFullExam ? (
                      <>
                        {/* Full Exam Selection */}
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                            {lang === 'fr' ? 'Sélectionnez un examen complet' : 'Select a Full Exam'}
                          </h3>
                          <p className="text-dark-600 dark:text-dark-400">
                            {lang === 'fr'
                              ? `${totalFullExamQuestions} questions réparties sur ${pmpFullExams.length} examens complets`
                              : `${totalFullExamQuestions} questions across ${pmpFullExams.length} full exams`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {pmpFullExams.map((exam) => (
                            <button
                              key={exam.id}
                              onClick={() => handleSelectFullExam(exam)}
                              className="group p-5 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 hover:border-primary-500/50 dark:hover:border-primary-500/50 transition-all hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                  <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-dark-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lang === 'fr' ? exam.nameFr : exam.name}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                                      {exam.questionCount} questions
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-4 h-4" />
                                      {lang === 'fr' ? 'Démarrer' : 'Start'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Full Exam Mode */}
                        <div className="space-y-6">
                          {/* Header with back button and progress */}
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <button
                              onClick={handleBackToFullExams}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700 transition-all"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {lang === 'fr' ? 'Retour aux examens complets' : 'Back to full exams'}
                            </button>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-dark-500 dark:text-dark-400">
                                {lang === 'fr' ? 'Question' : 'Question'} {currentFullQuestionIndex + 1} / {fullExamQuestions.length}
                              </span>
                              <button
                                onClick={handleRestartFullExam}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700"
                              >
                                <RotateCcw className="w-4 h-4" />
                                {lang === 'fr' ? 'Recommencer' : 'Restart'}
                              </button>
                            </div>
                          </div>

                          {/* Full Exam info */}
                          <div className="p-4 rounded-xl bg-gradient-to-r from-primary-400 to-primary-600 text-white">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6" />
                                <div>
                                  <h3 className="font-bold">{lang === 'fr' ? selectedFullExam.nameFr : selectedFullExam.name}</h3>
                                  <p className="text-sm opacity-90">{selectedFullExam.questionCount} questions</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {certFilter === 'pmp' && answeredFullQuestions.size < fullExamQuestions.length && (
                                  <button
                                    onClick={isOnBreak ? handleEndBreak : handleStartBreak}
                                    disabled={!isOnBreak && (breakCount >= MAX_BREAKS || totalBreakTimeUsed >= MAX_BREAK_TIME)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  >
                                    <Coffee className="w-4 h-4" />
                                    {isOnBreak
                                      ? (lang === 'fr' ? 'Reprendre' : 'Resume')
                                      : (lang === 'fr' ? `Pause ${breakCount}/${MAX_BREAKS}` : `Break ${breakCount}/${MAX_BREAKS}`)}
                                  </button>
                                )}
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-bold text-lg ${fullExamTimeRemaining < FULL_EXAM_DURATION * 0.1 ? 'bg-dark-400/30 animate-pulse' : 'bg-white/20'}`}>
                                  <Timer className="w-5 h-5" />
                                  {formatExamTime(fullExamTimeRemaining)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Break overlay */}
                          {isOnBreak && (
                            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/30">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Coffee className="w-6 h-6 text-primary-500" />
                                  <div>
                                    <h4 className="font-bold text-dark-900 dark:text-white">
                                      {lang === 'fr' ? `Pause ${breakCount}/${MAX_BREAKS}` : `Break ${breakCount}/${MAX_BREAKS}`}
                                    </h4>
                                    <p className="text-sm text-dark-500 dark:text-dark-400">
                                      {lang === 'fr' ? 'Le timer de l\'examen est en pause' : 'Exam timer is paused'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-dark-500 dark:text-dark-400">
                                    {lang === 'fr' ? 'Temps de pause restant' : 'Break time remaining'}
                                  </p>
                                  <p className={`font-mono font-bold text-lg ${(MAX_BREAK_TIME - totalBreakTimeUsed) < 60 ? 'text-dark-400 animate-pulse' : 'text-primary-600 dark:text-primary-400'}`}>
                                    {formatExamTime(MAX_BREAK_TIME - totalBreakTimeUsed)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Score */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-primary-500" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Correct' : 'Correct'}</p>
                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{fullExamScore.correct}</p>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-dark-400/10 border border-dark-400/20 flex items-center gap-3">
                              <XCircle className="w-5 h-5 text-dark-400" />
                              <div>
                                <p className="text-xs text-dark-500 dark:text-dark-400">{lang === 'fr' ? 'Incorrect' : 'Incorrect'}</p>
                                <p className="text-lg font-bold text-dark-500 dark:text-dark-400">{fullExamScore.incorrect}</p>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                              style={{ width: `${((currentFullQuestionIndex + 1) / fullExamQuestions.length) * 100}%` }}
                            />
                          </div>

                          {/* Question */}
                          {currentFullQuestion && (
                            <div className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 shadow-lg">
                              <p className="text-lg font-medium text-dark-900 dark:text-white mb-6 leading-relaxed">
                                {currentFullQuestion.question}
                              </p>

                              {/* Options */}
                              <div className="space-y-3">
                                {currentFullQuestion.options.map((option: string, index: number) => {
                                  const isSelected = selectedFullAnswer === option;
                                  const optionLetter = option.charAt(0);
                                  const correctLetter = currentFullQuestion.correctAnswer.charAt(0);
                                  const isCorrect = optionLetter === correctLetter;
                                  const showResult = showFullRationale;

                                  let optionClass = "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 w-full text-left";

                                  if (showResult) {
                                    if (isCorrect) {
                                      optionClass += " border-green-500 bg-green-50 dark:bg-green-900/20";
                                    } else if (isSelected && !isCorrect) {
                                      optionClass += " border-red-400 bg-red-50 dark:bg-red-900/20";
                                    } else {
                                      optionClass += " border-dark-200 dark:border-dark-600 opacity-50";
                                    }
                                  } else {
                                    optionClass += isSelected
                                      ? " border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                      : " border-dark-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10";
                                  }

                                  return (
                                    <button
                                      key={index}
                                      onClick={() => handleSelectFullAnswer(option)}
                                      disabled={showFullRationale}
                                      className={optionClass}
                                    >
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm ${
                                        showResult && isCorrect
                                          ? 'bg-primary-500 text-white'
                                          : showResult && isSelected && !isCorrect
                                          ? 'bg-dark-400 text-white'
                                          : isSelected
                                          ? 'bg-primary-500 text-white'
                                          : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-300'
                                      }`}>
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <span className={`text-left ${
                                        showResult && isCorrect
                                          ? 'text-primary-700 dark:text-primary-300 font-medium'
                                          : showResult && isSelected && !isCorrect
                                          ? 'text-dark-600 dark:text-dark-300'
                                          : 'text-dark-700 dark:text-dark-300'
                                      }`}>
                                        {option.replace(/^[A-E]\.\s*/, '')}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Rationale */}
                              {showFullRationale && (
                                <div className={`mt-6 p-4 rounded-xl ${
                                  selectedFullAnswer?.charAt(0) === currentFullQuestion.correctAnswer.charAt(0)
                                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                    : 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    {selectedFullAnswer?.charAt(0) === currentFullQuestion.correctAnswer.charAt(0) ? (
                                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                    ) : (
                                      <AlertTriangle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div>
                                      <p className={`font-semibold mb-1 ${
                                        selectedFullAnswer?.charAt(0) === currentFullQuestion.correctAnswer.charAt(0)
                                          ? 'text-primary-700 dark:text-primary-300'
                                          : 'text-primary-700 dark:text-primary-300'
                                      }`}>
                                        {selectedFullAnswer?.charAt(0) === currentFullQuestion.correctAnswer.charAt(0)
                                          ? (lang === 'fr' ? 'Correct !' : 'Correct!')
                                          : (lang === 'fr' ? 'Incorrect' : 'Incorrect')}
                                      </p>
                                      <p className="text-dark-600 dark:text-dark-400 text-sm">
                                        {currentFullQuestion.explanation}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Navigation */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={handlePrevFullQuestion}
                              disabled={currentFullQuestionIndex === 0}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 text-dark-600 dark:text-dark-300 hover:bg-dark-50 dark:hover:bg-dark-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                              {lang === 'fr' ? 'Précédent' : 'Previous'}
                            </button>

                            {showFullRationale && currentFullQuestionIndex < fullExamQuestions.length - 1 && (
                              <button
                                onClick={handleNextFullQuestion}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary-400 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                {lang === 'fr' ? 'Suivant' : 'Next'}
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            )}

                            {showFullRationale && currentFullQuestionIndex === fullExamQuestions.length - 1 && (
                              <button
                                onClick={handleBackToFullExams}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                <Trophy className="w-5 h-5" />
                                {lang === 'fr' ? 'Terminer' : 'Finish'}
                              </button>
                            )}
                          </div>

                          {/* Completion message */}
                          {answeredFullQuestions.size === fullExamQuestions.length && (
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20 text-center">
                              <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">
                                {examTimedOut
                                  ? (lang === 'fr' ? 'Temps écoulé !' : 'Time\'s Up!')
                                  : (lang === 'fr' ? 'Examen complet terminé !' : 'Full Exam Complete!')}
                              </h3>
                              {examTimedOut && (
                                <p className="text-dark-400 dark:text-dark-400 text-sm mb-2">
                                  {lang === 'fr' ? 'Les questions non répondues ont été marquées comme incorrectes.' : 'Unanswered questions were marked as incorrect.'}
                                </p>
                              )}
                              <p className="text-dark-600 dark:text-dark-400 mb-2">
                                {lang === 'fr'
                                  ? `Score: ${fullExamScore.correct}/${fullExamQuestions.length} (${Math.round((fullExamScore.correct / fullExamQuestions.length) * 100)}%)`
                                  : `Score: ${fullExamScore.correct}/${fullExamQuestions.length} (${Math.round((fullExamScore.correct / fullExamQuestions.length) * 100)}%)`}
                              </p>
                              <div className="flex justify-center gap-3 mt-4">
                                <button
                                  onClick={handleRestartFullExam}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-all"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                  {lang === 'fr' ? 'Recommencer' : 'Restart'}
                                </button>
                                <button
                                  onClick={handleBackToFullExams}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 dark:bg-dark-700 text-dark-700 dark:text-dark-300 font-medium hover:bg-dark-200 dark:hover:bg-dark-600 transition-all"
                                >
                                  {lang === 'fr' ? 'Autre examen complet' : 'Other full exam'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Certification Info Card (for non-PMP) */}
            {activeCertification && activeCertification.detailedDescription && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-white to-dark-50 dark:from-dark-800 dark:to-dark-900 border border-dark-200 dark:border-dark-700 shadow-lg">
                <p className="text-dark-700 dark:text-dark-300 text-lg leading-relaxed mb-4">
                  {activeCertification.detailedDescription}
                </p>
                {activeCertification.highlights && activeCertification.highlights.length > 0 && (
                  <div>
                    <p className="text-dark-900 dark:text-white font-semibold mb-3">
                      {lang === 'fr' ? 'Elle valide votre capacité à :' : 'It validates your ability to:'}
                    </p>
                    <ul className="space-y-2">
                      {activeCertification.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-3 text-dark-600 dark:text-dark-400">
                          <span className="mt-1.5 w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Categories Grid (for non-PMP) */}
            <div className="space-y-8">
              {filteredCategories.map((category) => {
                const colors = colorMap[category.color] || colorMap.primary;
                const Icon = iconMap[category.icon] || Shield;
                const hasSubcategories = category.subcategories && category.subcategories.length > 0;
                const hasDirectTopics = category.topics && category.topics.length > 0;

                return (
                  <div key={category.id} className="space-y-6">
                    {/* Main Category Header */}
                    <div className="flex items-center gap-4 pb-4 border-b border-dark-200 dark:border-dark-700">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-dark-900 dark:text-white">
                          {category.name}
                        </h2>
                        <p className="text-dark-600 dark:text-dark-400 text-sm">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    {/* Direct Topics (if any) */}
                    {hasDirectTopics && renderTopicCard(category)}

                    {/* Subcategories */}
                    {hasSubcategories && (
                      <div className="grid gap-6">
                        {category.subcategories!.map((subcat) => renderTopicCard(subcat, category.color))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
