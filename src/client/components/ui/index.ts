/**
 * Pioneer OS - Shared UI Component Library
 *
 * Import components from this file for consistent UI across the application.
 *
 * @example
 * ```tsx
 * import { Button, Badge, Modal, TextInput, Avatar, Tabs } from '@/client/components/ui'
 * ```
 */

// Button
export { Button } from './Button'

// Card
export { Card, CardHeader, CardContent, CardFooter } from './Card'

// Badge
export { Badge, StatusBadge, TierBadge, CountBadge } from './Badge'

// Modal
export { Modal, ModalBody, ModalFooter, ConfirmModal } from './Modal'

// Input components
export {
  InputWrapper,
  TextInput,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
} from './Input'

// Tabs
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SimpleTabs,
} from './Tabs'

// Avatar
export { Avatar, AvatarGroup, AvatarWithText } from './Avatar'

// Profile Picture (with edit capability)
export { ProfilePicture, Avatar as SimpleAvatar } from './ProfilePicture'

// Skeleton loading states
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonTable,
} from './Skeleton'

// Error handling
export {
  ErrorBoundary,
  ErrorState,
  EmptyState,
} from '../ErrorBoundary'

// InfoTooltip
export { InfoTooltip } from './InfoTooltip'

// Breadcrumb
export { Breadcrumb } from './Breadcrumb'
