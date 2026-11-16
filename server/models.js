import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  _id: String,
  name: String,
  role: String,
  tagline: String,
  bio: String,
  phone: String,
  email: String,
  location: String,
  photo: String,
  resume_pdf: String,
  links: {
    github: String,
    linkedin: String,
  },
}, { _id: false });

const SocialSchema = new mongoose.Schema({
  _id: String,
  label: String,
  url: String,
  icon: String,
}, { _id: false });

const SkillSchema = new mongoose.Schema({
  _id: String,
  category: String,
  items: [String],
}, { _id: false });

const ProjectSchema = new mongoose.Schema({
  _id: String,
  slug: String,
  name: String,
  subtitle: String,
  team: String,
  role: String,
  stack: [String],
  highlights: [String],
  github: String,
  live: String,
}, { _id: false });

const ExperienceSchema = new mongoose.Schema({
  _id: String,
  company: String,
  title: String,
  period: String,
  detail: String,
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  _id: String,
  institution: String,
  location: String,
  degree: String,
  period: String,
  cgpa: String,
}, { _id: false });

const AchievementSchema = new mongoose.Schema({
  _id: String,
  title: String,
  badge: String,
  tag: String,
  detail: String,
}, { _id: false });

const ContactSchema = new mongoose.Schema({
  _id: String,
  email: String,
  phone: String,
  github: String,
  linkedin: String,
  location: String,
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const PortfolioDataSchema = new mongoose.Schema({
  _id: { type: String, default: 'portfolio_v1' },
  profile: ProfileSchema,
  socials: [SocialSchema],
  skills: [SkillSchema],
  projects: [ProjectSchema],
  experience: [ExperienceSchema],
  education: [EducationSchema],
  achievements: [AchievementSchema],
  contact: ContactSchema,
  gui: {
    wallpaper: String,
    welcomeText: String,
    menuBarName: String,
  },
  widgets: mongoose.Schema.Types.Mixed,
}, { _id: false });

export const PortfolioData = mongoose.model('PortfolioData', PortfolioDataSchema, 'portfoliodata');
export const Message = mongoose.model('Message', MessageSchema, 'messages');

