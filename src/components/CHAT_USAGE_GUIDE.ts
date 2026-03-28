/**
 * USAGE GUIDE: Modern Chat Panel Integration
 * ==========================================
 * 
 * This guide shows how to use the new chat panel system in your application.
 * 
 * ## Overview
 * The chat panel system consists of:
 * 1. ChatContext - Global state management for chat panel
 * 2. ModernChatPanel - The slide-in chat UI component
 * 3. ChatButton - Floating action button to open chat
 * 4. AgentProvider - Wrapper that provides chat functionality globally
 * 
 * ## Automatic Integration
 * The chat button is automatically available on all pages (except /login)
 * because it's included in the AgentProvider in the root layout.
 * 
 * ## Manual Integration (Optional)
 * If you want to trigger the chat panel from a custom button or component:
 * 
 * ```tsx
 * "use client";
 * 
 * import { useChatPanel } from "@/components/ChatContext";
 * 
 * export default function MyComponent() {
 *   const { openChat, closeChat, toggleChat, isChatOpen } = useChatPanel();
 * 
 *   return (
 *     <div>
 *       <button onClick={openChat}>
 *         Open AI Assistant
 *       </button>
 *       
 *       <button onClick={closeChat}>
 *         Close Chat
 *       </button>
 *       
 *       <button onClick={toggleChat}>
 *         Toggle Chat
 *       </button>
 *       
 *       {isChatOpen && <p>Chat is currently open</p>}
 *     </div>
 *   );
 * }
 * ```
 * 
 * ## Features
 * - ✅ Slide-in panel from the right side
 * - ✅ Dark theme matching the design
 * - ✅ Maximize/minimize functionality
 * - ✅ Backdrop with blur effect
 * - ✅ Smooth animations
 * - ✅ Preserves all existing Agent functionality
 * - ✅ Global state management
 * - ✅ Floating action button with notification badge
 * 
 * ## Customization
 * You can customize the chat button appearance by modifying:
 * - ChatButton.tsx - For button styling and position
 * - ModernChatPanel.tsx - For panel styling and layout
 * 
 * ## Notes
 * - The original Agent.tsx component is completely preserved
 * - All existing functionality remains intact
 * - The chat panel uses the same AgenQ SDK configuration
 * - No breaking changes to existing code
 */

export { };
