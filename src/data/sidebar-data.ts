import {
  IconHelp,
  IconLayoutDashboard,
  IconSettings,
  IconUserCog,
  IconNotification,
  IconPalette,
  IconStethoscope,
  IconInfoCircle,
  IconReportMedical,
  IconMicroscope,
  IconScan,
  IconX,
  IconActivity,
  IconHeart,
} from '@tabler/icons-react'
import { Command } from 'lucide-react'
import { type SidebarData } from '@/components/layout/types'

export const sidebarData: SidebarData = {
  user: {
    name: '@ResultAI',
    email: 'Support@ResultAI',
    avatar: '/images/buddy.png',
  },
  teams: [
    {
      name: 'ResultAI',
      logo: Command,
      plan: 'Clinical System',
    }
  ],
  navGroups: [
    {
      title: 'Clinical',
      items: [
        {
          title: 'Home',
          url: '/home',
          icon: IconLayoutDashboard,
        },
        {
          title: 'Patients',
          url: '/patients',
          icon: IconStethoscope,
        },
        {
          title: 'Lab Results',
          url: '/results',
          icon: IconReportMedical,
          items: [
            {
              title: 'Pathology',
              url: '/results/pathology',
              icon: IconMicroscope,
            },
            {
              title: 'MRI Scans',
              url: '/results/mri',
              icon: IconScan,
            },
            {
              title: 'X-Ray',
              url: '/results/xray',
              icon: IconX,
            },
            {
              title: 'ECG',
              url: '/results/ecg',
              icon: IconActivity,
            },
            {
              title: 'Cardiac',
              url: '/results/cardiac',
              icon: IconHeart,
            },
          ],
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'About',
          url: '/about',
          icon: IconInfoCircle,
        },
        {
          title: 'Settings',
          icon: IconSettings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: IconNotification,
            },
          ],
        },
        {
          title: 'Help',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
} 