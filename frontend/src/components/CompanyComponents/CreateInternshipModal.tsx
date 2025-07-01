"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

interface CreateInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface MatchingCriteria {
  skills: number;
  projects: number;
  experience: number;
  gpa: number;
  certifications: number;
}

const CreateInternshipModal: React.FC<CreateInternshipModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    aboutRole: '',
    domain: '',
    duration: '',
    location: '',
    salary: { min: 0, max: 0 },
    workMode: '',
    requirements: [''],
    benefits: [''],
    preferredSkills: [''],
    minimumGPA: 0,
    applicationDeadline: '',
    positions: 1
  });

  const [matchingCriteria, setMatchingCriteria] = useState<MatchingCriteria>({
    skills: 40,
    projects: 30,
    experience: 20,
    gpa: 5,
    certifications: 5
  });

  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleCriteriaChange = (field: keyof MatchingCriteria, value: number) => {
    setMatchingCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTotalPercentage = () => {
    return Object.values(matchingCriteria).reduce((sum, val) => sum + val, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Math.abs(getTotalPercentage() - 100) > 0.01) {
      toast.error('Matching criteria must sum to 100%');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        matchingCriteria,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        benefits: formData.benefits.filter(benefit => benefit.trim() !== ''),
        preferredSkills: formData.preferredSkills.filter(skill => skill.trim() !== ''),
        isPublished: true
      };

      const response = await fetch(`${API_BASE_URL}/api/company/create-internship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Internship created successfully!');
        onSuccess();
        // Reset form
        setFormData({
          title: '',
          description: '',
          aboutRole: '',
          domain: '',
          duration: '',
          location: '',
          salary: { min: 0, max: 0 },
          workMode: '',
          requirements: [''],
          benefits: [''],
          preferredSkills: [''],
          minimumGPA: 0,
          applicationDeadline: '',
          positions: 1
        });
        setMatchingCriteria({
          skills: 40,
          projects: 30,
          experience: 20,
          gpa: 5,
          certifications: 5
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create internship');
      }
    } catch (error) {
      console.error('Error creating internship:', error);
      toast.error('Error creating internship');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Internship</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain *</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="aboutRole">About the Role</Label>
            <Textarea
              id="aboutRole"
              value={formData.aboutRole}
              onChange={(e) => handleInputChange('aboutRole', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 3 months"
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="workMode">Work Mode *</Label>
              <Select value={formData.workMode} onValueChange={(value) => handleInputChange('workMode', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="onsite">On-site</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMin">Minimum Salary *</Label>
              <Input
                id="salaryMin"
                type="number"
                value={formData.salary.min}
                onChange={(e) => handleInputChange('salary', { ...formData.salary, min: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Maximum Salary *</Label>
              <Input
                id="salaryMax"
                type="number"
                value={formData.salary.max}
                onChange={(e) => handleInputChange('salary', { ...formData.salary, max: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Matching Criteria */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Matching Criteria</h3>
              <Badge variant={getTotalPercentage() === 100 ? 'default' : 'destructive'}>
                Total: {getTotalPercentage()}%
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(matchingCriteria).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="capitalize">{key}</Label>
                    <span className="text-sm font-medium">{value}%</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(values) => handleCriteriaChange(key as keyof MatchingCriteria, values[0])}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minimumGPA">Minimum GPA</Label>
              <Input
                id="minimumGPA"
                type="number"
                step="0.1"
                value={formData.minimumGPA}
                onChange={(e) => handleInputChange('minimumGPA', Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="positions">Number of Positions</Label>
              <Input
                id="positions"
                type="number"
                value={formData.positions}
                onChange={(e) => handleInputChange('positions', Number(e.target.value))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="applicationDeadline">Application Deadline</Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={formData.applicationDeadline}
                onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Arrays */}
          {['requirements', 'benefits', 'preferredSkills'].map((field) => (
            <div key={field}>
              <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
              <div className="space-y-2 mt-2">
                {(formData[field as keyof typeof formData] as string[]).map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleArrayChange(field, index, e.target.value)}
                      placeholder={`Enter ${field.slice(0, -1)}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(field, index)}
                      disabled={(formData[field as keyof typeof formData] as string[]).length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(field)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {field.slice(0, -1)}
                </Button>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || getTotalPercentage() !== 100}>
              {loading ? 'Creating...' : 'Create Internship'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInternshipModal; 