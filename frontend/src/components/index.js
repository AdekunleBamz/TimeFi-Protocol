/**
 * TimeFi UI Components - Centralized exports for all UI components.
 *
 * This module provides a single import point for all reusable UI components
 * used throughout the TimeFi Protocol frontend application.
 *
 * Components are organized by category:
 * - Layout: Header, Dashboard, VaultDetails, NotFound
 * - Cards: Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, VaultCard, StatsCard
 * - Forms: Button, Input, Select, CreateVaultForm
 * - Feedback: Alert, Badge, Toast, Modal, Tooltip
 * - Loading: Skeleton, Progress, Countdown
 * - Data Display: TransactionList, Avatar, Tabs
 * - Utility: CopyButton, EmptyState, ErrorBoundary
 *
 * @module components
 * @author adekunlebamz
 * @example
 * // Import specific components
 * import { Button, Card, Input } from './components';
 *
 * // Or import everything
 * import * as UI from './components';
 * <UI.Button variant="primary">Click me</UI.Button>
 */
import { Tooltip } from './Tooltip';

// Layout
export { Header } from './Header';
export { Dashboard } from './Dashboard';
export { VaultDetails } from './VaultDetails';
export { NotFound } from './NotFound';

// Cards
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './Card';
export { VaultCard } from './VaultCard';
export { StatsCard } from './StatsCard';

// Forms
export { Button } from './Button';
export { Input } from './Input';
export { Select } from './Select';
export { CreateVaultForm } from './CreateVaultForm';

// Feedback
export { Alert, InfoAlert, SuccessAlert, WarningAlert, ErrorAlert, InlineAlert } from './Alert';
export { Badge } from './Badge';
export { Toast, ToastProvider, useToast } from './Toast';
export { Modal } from './Modal';
export { Tooltip } from './Tooltip';

// Loading States
export { Skeleton } from './Skeleton';
export { Progress } from './Progress';
export { Countdown } from './Countdown';

// Data Display
export { TransactionList } from './TransactionList';
export { Avatar } from './Avatar';
export { Tabs, TabList, Tab, TabPanels, TabPanel } from './Tabs';

// Utility
export { CopyButton, CopyableAddress } from './CopyButton';
export { EmptyState } from './EmptyState';
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { ConfirmModal } from './ConfirmModal';
export { ScrollToTop } from './ScrollToTop';
