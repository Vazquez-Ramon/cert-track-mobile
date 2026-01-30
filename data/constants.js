// data/constants.js
import RHYTHM_QUESTIONS from './rhythm.json';

import itfBeginner from './itf_beginner.json';
import itfIntermediate from './itf_intermediate.json';
import itfAdvanced from './itf_advanced.json';

import electricianQuestions from './electrician_apprentice.json';
import hvacQuestions from './hvac_intro.json';

import cloudQuestions from './cloud_foundations.json';

import personalFinanceQuestions from './personal_finance_basics.json';
import bankTellerQuestions from './bank_teller.json';

import projectMgmtQuestions from './project_mgmt_intro.json';
import customerServiceQuestions from './customer_service_pro.json';

export const CATEGORIES = [
  { id: 'trades', name: 'Trades', icon: '🛠️' },
  { id: 'tech', name: 'Tech', icon: '💻' },
  { id: 'finance', name: 'Finance', icon: '💰' },
  { id: 'business', name: 'Business', icon: '📈' },
  { id: 'nursing', name: 'Nursing', icon: '🩺' },
];

export const EXAMS = [
  {
    id: 'electrician_apprentice',
    categoryId: 'trades',
    name: 'Electrician Apprentice Prep',
    description: 'Basic wiring, safety, and code knowledge.',
    difficulty: 'Beginner',
  },
  {
    id: 'hvac_intro',
    categoryId: 'trades',
    name: 'HVAC Fundamentals',
    description: 'Refrigeration cycle, safety, tools.',
    difficulty: 'Beginner',
  },
  {
    id: 'comptia_itf_plus_beginner',
    categoryId: 'tech',
    name: 'CompTIA ITF+ – Beginner',
    description: '50 warm-up questions on IT basics.',
    difficulty: 'Beginner',
  },
  {
    id: 'comptia_itf_plus_intermediate',
    categoryId: 'tech',
    name: 'CompTIA ITF+ – Intermediate',
    description: 'Deeper networking, OS, and security questions.',
    difficulty: 'Intermediate',
  },
  {
    id: 'comptia_itf_plus_advanced',
    categoryId: 'tech',
    name: 'CompTIA ITF+ – Advanced',
    description: 'Challenging scenarios and mixed question types.',
    difficulty: 'Advanced',
  },
  {
    id: 'cloud_foundations',
    categoryId: 'tech',
    name: 'Cloud Foundations',
    description: 'Intro to cloud, IaaS / PaaS / SaaS.',
    difficulty: 'Beginner',
  },
  {
    id: 'personal_finance_basics',
    categoryId: 'finance',
    name: 'Personal Finance Essentials',
    description: 'Budgeting, credit, saving, debt.',
    difficulty: 'Beginner',
  },
  {
    id: 'bank_teller',
    categoryId: 'finance',
    name: 'Bank Teller Readiness',
    description: 'Customer interactions, cash handling, compliance.',
    difficulty: 'Beginner',
  },
  {
    id: 'project_mgmt_intro',
    categoryId: 'business',
    name: 'Project Management Basics',
    description: 'Scope, time, cost, stakeholders.',
    difficulty: 'Beginner',
  },
  {
    id: 'nursing_rhythms',          // 👈 examId used in navigation
    categoryId: 'nursing',          // 👈 links to Nursing category above
    name: 'Cardiac Rhythms & ACLS',
    description: 'Identify key cardiac rhythms and understand basic ACLS priorities.',
    difficulty: 'advanced',
  },
  {
    id: 'customer_service_pro',
    categoryId: 'business',
    name: 'Customer Service Pro',
    description: 'Soft skills, de-escalation, communication.',
    difficulty: 'Beginner',
  },
];

export const QUESTION_BANK = {
  comptia_itf_plus_beginner: itfBeginner,
  comptia_itf_plus_intermediate: itfIntermediate,
  comptia_itf_plus_advanced: itfAdvanced,
  electrician_apprentice: electricianQuestions,
  hvac_intro: hvacQuestions,
  cloud_foundations: cloudQuestions,
  personal_finance_basics: personalFinanceQuestions,
  bank_teller: bankTellerQuestions,
  project_mgmt_intro: projectMgmtQuestions,
  customer_service_pro: customerServiceQuestions,
  nursing_rhythms: RHYTHM_QUESTIONS,
};

export const SPLASH_MESSAGES = [
  'Sharpening your edge…',
  'Loading question banks…',
  'Summoning Fraiah TinyGPT…',
  'Warming up trades, tech, and finance…',
  'Syncing XP, streaks, and stats…',
];

export const todayString = () => new Date().toISOString().slice(0, 10);