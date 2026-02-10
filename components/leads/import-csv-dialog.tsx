'use client';

import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Timestamp } from 'firebase/firestore';
import { useLeadStore } from '@/lib/stores';
import { useAuth } from '@/lib/auth-context';
import { calculateInitialScore, getLeadPriority } from '@/lib/lead-scoring';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import type { Lead, LeadSource, PropertyType, CSVLeadRow } from '@/lib/types';

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportCSVDialog({ open, onOpenChange }: ImportCSVDialogProps) {
  const { user } = useAuth();
  const { addLead } = useLeadStore();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setErrors([]);
    }
  };

  const downloadTemplate = () => {
    const headers = 'name,phone,email,source,budget,location,property_type,notes';
    const example = 'John Doe,+919876543210,john@example.com,website,5000000,Whitefield Bangalore,flat,Looking for 3BHK';
    const csv = `${headers}\n${example}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proplead_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validateSource = (source: string): LeadSource => {
    const validSources = ['website', 'whatsapp', 'portal', 'manual', 'csv', 'facebook', 'walk-in'];
    return validSources.includes(source.toLowerCase()) 
      ? source.toLowerCase() as LeadSource 
      : 'csv';
  };

  const validatePropertyType = (type: string): PropertyType | undefined => {
    const validTypes = ['flat', 'plot', 'villa', 'commercial', 'other'];
    return validTypes.includes(type.toLowerCase()) 
      ? type.toLowerCase() as PropertyType 
      : undefined;
  };

  const handleImport = useCallback(async () => {
    if (!file || !user) return;

    setImporting(true);
    setProgress(0);
    setErrors([]);

    Papa.parse<CSVLeadRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        let successCount = 0;
        let failedCount = 0;
        const importErrors: string[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          
          try {
            if (!row.name || !row.phone) {
              throw new Error(`Row ${i + 1}: Name and phone are required`);
            }

            const budget = row.budget ? parseInt(row.budget.replace(/[^0-9]/g, '')) : undefined;
            const source = validateSource(row.source || 'csv');
            const initialScore = calculateInitialScore(source, !!budget);
            const priority = getLeadPriority(initialScore);

            const newLead: Lead = {
              id: `lead-${Date.now()}-${i}`,
              user_id: user.uid,
              assigned_to: user.uid,
              name: row.name.trim(),
              phone: row.phone.trim(),
              email: row.email?.trim() || undefined,
              source,
              budget,
              location: row.location?.trim() || undefined,
              property_type: validatePropertyType(row.property_type || ''),
              status: 'new',
              notes: row.notes?.trim() || undefined,
              lead_score: initialScore,
              lead_priority: priority,
              message_count: 0,
              created_at: Timestamp.now(),
              updated_at: Timestamp.now(),
            };

            addLead(newLead);
            successCount++;
          } catch (error) {
            failedCount++;
            if (error instanceof Error) {
              importErrors.push(error.message);
            }
          }

          setProgress(Math.round(((i + 1) / rows.length) * 100));
        }

        setResult({ success: successCount, failed: failedCount });
        setErrors(importErrors);
        setImporting(false);
      },
      error: (error) => {
        setErrors([`CSV parsing error: ${error.message}`]);
        setImporting(false);
      },
    });
  }, [file, user, addLead]);

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setErrors([]);
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Leads from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with lead data. Download the template for the correct format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>

          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            {!file ? (
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload CSV</p>
                <p className="text-xs text-gray-400 mt-1">Max 1000 rows</p>
              </label>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {importing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-500">
                Importing... {progress}%
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{result.success} leads imported successfully</span>
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{result.failed} rows failed</span>
                </div>
              )}
            </div>
          )}

          {errors.length > 0 && (
            <div className="max-h-32 overflow-y-auto bg-red-50 rounded-lg p-3">
              {errors.slice(0, 5).map((error, index) => (
                <p key={index} className="text-xs text-red-600">{error}</p>
              ))}
              {errors.length > 5 && (
                <p className="text-xs text-red-600 font-medium mt-1">
                  And {errors.length - 5} more errors...
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button onClick={handleImport} disabled={!file || importing}>
                {importing ? 'Importing...' : 'Import'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
