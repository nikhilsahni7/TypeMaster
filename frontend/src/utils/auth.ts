import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  id: string;
  username: string;
  isGuest: boolean;
}

const ADJECTIVES = ['Swift', 'Rapid', 'Turbo', 'Hyper', 'Sonic', 'Flash', 'Neon', 'Cyber'];
const NOUNS = ['Typer', 'Coder', 'Hacker', 'Racer', 'Glitch', 'Byte', 'Pixel', 'Surfer'];

function generateGuestName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
}

export const getOrCreateProfile = (): UserProfile => {
  const stored = localStorage.getItem('typemaster_profile');
  if (stored) {
    return JSON.parse(stored);
  }

  const newProfile: UserProfile = {
    id: uuidv4(),
    username: generateGuestName(),
    isGuest: true,
  };

  localStorage.setItem('typemaster_profile', JSON.stringify(newProfile));
  return newProfile;
};
