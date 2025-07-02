"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CompanySidebar } from "@/components/CompanyComponents/company-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export default function ProfilePage() {
  return (
    <>
      
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-8">
            {/* ProfileContent component is now defined within the ProfilePage component */}
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your company's information and branding.</p>
              </div>

              <Card>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Enter company name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" placeholder="Enter industry" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-description">Company Description</Label>
                    <Textarea
                      id="company-description"
                      placeholder="Describe your company..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://www.company.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" placeholder="contact@company.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social-media">Social Media Links</Label>
                    <Input id="social-media" placeholder="LinkedIn, Twitter, etc." />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button size="lg" className="px-8">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </>
  )
}
