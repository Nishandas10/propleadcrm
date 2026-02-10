'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { DUMMY_LEADS, DUMMY_MESSAGES } from '@/lib/dummy-data';
import { Lead, Message } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Phone,
  Search,
  Send,
  MoreVertical,
  PhoneCall,
  PhoneOff,
  MessageCircle,
  Clock,
  CheckCheck,
  Check,
  Sparkles,
  Copy,
  ExternalLink,
  Smartphone,
  MessagesSquare,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Channel types
type MessageChannel = 'all' | 'whatsapp' | 'sms';

// Conversation type combining lead + last message
interface Conversation {
  lead: Lead;
  lastMessage?: Message;
  unreadCount: number;
  channel: 'whatsapp' | 'sms';
}

export default function MessagesPage() {
  const { isGuest } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [channelFilter, setChannelFilter] = useState<MessageChannel>('all');
  const [sendChannel, setSendChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  
  // Call dialog state
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [callInProgress, setCallInProgress] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotes, setCallNotes] = useState('');
  
  // AI suggestion state
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Message stats
  const messageStats = useMemo(() => {
    const whatsappConvs = conversations.filter(c => c.channel === 'whatsapp');
    const smsConvs = conversations.filter(c => c.channel === 'sms');
    const unreadTotal = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
    
    return {
      total: conversations.length,
      whatsapp: whatsappConvs.length,
      sms: smsConvs.length,
      unread: unreadTotal,
    };
  }, [conversations]);

  // Load dummy data for guest mode
  useEffect(() => {
    if (isGuest) {
      // Create conversations from leads and messages
      const convs: Conversation[] = DUMMY_LEADS.map((lead, index) => {
        const leadMessages = DUMMY_MESSAGES[lead.id] || [];
        const lastMessage = leadMessages[leadMessages.length - 1];
        // Alternate between whatsapp and sms for demo
        const channel: 'whatsapp' | 'sms' = index % 3 === 0 ? 'sms' : 'whatsapp';
        return {
          lead,
          lastMessage,
          unreadCount: leadMessages.filter(m => m.direction === 'in' && m.status !== 'read').length,
          channel,
        };
      });
      
      // Sort by last message timestamp
      convs.sort((a, b) => {
        const aTime = a.lastMessage?.timestamp?.toDate?.()?.getTime() || 0;
        const bTime = b.lastMessage?.timestamp?.toDate?.()?.getTime() || 0;
        return bTime - aTime;
      });
      
      setConversations(convs);
      
      // Select first conversation by default
      if (convs.length > 0) {
        setSelectedLead(convs[0].lead);
        setMessages(DUMMY_MESSAGES[convs[0].lead.id] || []);
        setSendChannel(convs[0].channel);
      }
    }
  }, [isGuest]);

  // Filter conversations based on search and channel
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // Filter by channel
    if (channelFilter !== 'all') {
      filtered = filtered.filter((c) => c.channel === channelFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.lead.name.toLowerCase().includes(query) ||
          c.lead.phone.includes(query) ||
          c.lastMessage?.content.toLowerCase().includes(query)
      );
    }
    
    if (activeTab === 'unread') {
      filtered = filtered.filter((c) => c.unreadCount > 0);
    }
    
    return filtered;
  }, [conversations, searchQuery, activeTab, channelFilter]);

  // Handle selecting a conversation
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedLead(conv.lead);
    setMessages(DUMMY_MESSAGES[conv.lead.id] || []);
    setSendChannel(conv.channel);
    setAiSuggestion('');
  };

  // Send a message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedLead) return;
    
    // In real app, this would call the WhatsApp or SMS API
    const channelLabel = sendChannel === 'whatsapp' ? 'WhatsApp' : 'SMS';
    toast.success(`${channelLabel} message sent!`);
    setNewMessage('');
  };

  // Generate AI suggestion
  const generateAiSuggestion = async () => {
    if (!selectedLead) return;
    
    setLoadingAi(true);
    try {
      const response = await fetch('/api/ai/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: selectedLead.name,
          leadContext: `Budget: ₹${selectedLead.budget?.toLocaleString() || 'Not specified'}, 
            Location: ${selectedLead.location || 'Not specified'}, 
            Property: ${selectedLead.property_type || 'Not specified'},
            Status: ${selectedLead.status}`,
          messageHistory: messages.map((m) => ({
            role: m.direction === 'in' ? 'user' : 'assistant',
            content: m.content,
          })),
          replyTone: 'professional',
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setAiSuggestion(data.reply);
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast.error('Failed to generate suggestion');
    } finally {
      setLoadingAi(false);
    }
  };

  // Use AI suggestion
  const useAiSuggestion = () => {
    setNewMessage(aiSuggestion);
    setAiSuggestion('');
  };

  // Initiate a call
  const handleStartCall = () => {
    if (!selectedLead) return;
    setShowCallDialog(true);
    setCallInProgress(true);
    setCallDuration(0);
    setCallNotes('');
    
    // Start call timer
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    
    // Store interval ID to clear later
    (window as Window & { callInterval?: NodeJS.Timeout }).callInterval = interval;
  };

  // End call
  const handleEndCall = () => {
    setCallInProgress(false);
    const interval = (window as Window & { callInterval?: NodeJS.Timeout }).callInterval;
    if (interval) clearInterval(interval);
  };

  // Save call log
  const handleSaveCallLog = () => {
    toast.success('Call logged successfully!');
    setShowCallDialog(false);
    setCallInProgress(false);
    setCallDuration(0);
    setCallNotes('');
  };

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Open phone dialer
  const openPhoneDialer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
    toast.info('Opening phone dialer...');
  };

  // Open SMS app
  const openSmsApp = (phone: string) => {
    window.open(`sms:${phone}`, '_self');
    toast.info('Opening SMS app...');
  };

  // Open WhatsApp
  const openWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  // Copy phone number
  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success('Phone number copied!');
  };

  // Get message status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      default:
        return <Clock className="w-3 h-3 text-gray-300" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Dashboard Header */}
        <div className="border-b bg-white p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-muted-foreground">Unified inbox for WhatsApp & SMS</p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex items-center gap-3">
              <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">WhatsApp</p>
                    <p className="text-lg font-bold text-green-700">{messageStats.whatsapp}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SMS</p>
                    <p className="text-lg font-bold text-blue-700">{messageStats.sms}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                    <MessagesSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Unread</p>
                    <p className="text-lg font-bold text-red-700">{messageStats.unread}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-96 border-r flex flex-col">
          {/* Header */}
          <div className="p-4 border-b space-y-4">
            {/* Channel Filter */}
            <div className="flex items-center gap-2">
              <Button
                variant={channelFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChannelFilter('all')}
                className="flex-1"
              >
                <MessagesSquare className="w-4 h-4 mr-1" />
                All
              </Button>
              <Button
                variant={channelFilter === 'whatsapp' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChannelFilter('whatsapp')}
                className="flex-1"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
              <Button
                variant={channelFilter === 'sms' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChannelFilter('sms')}
                className="flex-1"
              >
                <Smartphone className="w-4 h-4 mr-1" />
                SMS
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">
                  Unread
                  {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 justify-center">
                      {conversations.filter(c => c.unreadCount > 0).length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.lead.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedLead?.id === conv.lead.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {conv.lead.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Channel indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                        conv.channel === 'whatsapp' ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        {conv.channel === 'whatsapp' ? (
                          <MessageSquare className="w-3 h-3 text-white" />
                        ) : (
                          <Smartphone className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{conv.lead.name}</span>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(conv.lastMessage.timestamp.toDate(), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="h-5 w-5 p-0 justify-center rounded-full">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedLead ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {selectedLead.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Channel indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      sendChannel === 'whatsapp' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {sendChannel === 'whatsapp' ? (
                        <MessageSquare className="w-3 h-3 text-white" />
                      ) : (
                        <Smartphone className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="font-semibold">{selectedLead.name}</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>
                      <Badge variant="outline" className={`text-xs ${
                        sendChannel === 'whatsapp' ? 'border-green-500 text-green-600' : 'border-blue-500 text-blue-600'
                      }`}>
                        {sendChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Call Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartCall}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </Button>
                  
                  {/* More Options */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openPhoneDialer(selectedLead.phone)}>
                        <PhoneCall className="mr-2 h-4 w-4" />
                        Open Phone Dialer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openSmsApp(selectedLead.phone)}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send SMS
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openWhatsApp(selectedLead.phone)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Open WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyPhone(selectedLead.phone)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Phone Number
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`/leads/${selectedLead.id}`, '_blank')}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Lead Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.direction === 'out' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.direction === 'out'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {format(message.timestamp.toDate(), 'h:mm a')}
                            </span>
                            {message.direction === 'out' && getStatusIcon(message.status)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* AI Suggestion */}
              {aiSuggestion && (
                <div className="px-4 py-2 bg-purple-50 border-t">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 mt-1 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-purple-900">{aiSuggestion}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="mt-1 h-7 text-xs"
                        onClick={useAiSuggestion}
                      >
                        Use this reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-4 border-t">
                {/* Channel Selector */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">Send via:</span>
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    <Button
                      variant={sendChannel === 'whatsapp' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSendChannel('whatsapp')}
                      className="h-7 gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      WhatsApp
                    </Button>
                    <Button
                      variant={sendChannel === 'sms' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSendChannel('sms')}
                      className="h-7 gap-1"
                    >
                      <Smartphone className="w-3 h-3" />
                      SMS
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Type a ${sendChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} message...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-10 max-h-32 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={generateAiSuggestion}
                      disabled={loadingAi}
                      title="Get AI suggestion"
                    >
                      <Sparkles className={`h-4 w-4 ${loadingAi ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      className={sendChannel === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="mx-auto h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>

        {/* Call Dialog */}
        <Dialog open={showCallDialog} onOpenChange={(open) => {
          if (!open && callInProgress) {
            handleEndCall();
          }
          setShowCallDialog(open);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {callInProgress ? 'Call in Progress' : 'Call Summary'}
              </DialogTitle>
              <DialogDescription>
                {callInProgress 
                  ? `Calling ${selectedLead?.name}...`
                  : `Call with ${selectedLead?.name} ended`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Call Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl">
                        {selectedLead?.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedLead?.name}</h3>
                      <p className="text-muted-foreground">{selectedLead?.phone}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions during call */}
              {callInProgress && (
                <div className="flex justify-center gap-4">
                  <Button
                    variant="destructive"
                    size="lg"
                    className="rounded-full h-14 w-14 p-0"
                    onClick={handleEndCall}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                </div>
              )}

              {/* Call Notes (after call ends) */}
              {!callInProgress && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Call Notes</label>
                    <Textarea
                      placeholder="Add notes about this call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              {callInProgress ? (
                <Button variant="outline" onClick={() => openPhoneDialer(selectedLead?.phone || '')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Phone App
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowCallDialog(false)}>
                    Discard
                  </Button>
                  <Button onClick={handleSaveCallLog}>
                    Save Call Log
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </DashboardLayout>
  );
}
