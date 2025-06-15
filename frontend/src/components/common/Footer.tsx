import Link from "next/link"
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                <span className="text-[#535c91]">Level</span>
                <span className="text-primary">UP</span>
              </span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              Connecting students with top companies and experienced mentors to kickstart careers through internships
              and mentorship programs.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/internship" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/mentorship" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Mentorship
                </Link>
              </li>
              <li>
                <Link href="/mock-interviews" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Mock Interviews
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/join" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/student" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/mentor" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Mentor Portal
                </Link>
              </li>
              <li>
                <Link href="/company" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Company Portal
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stay Connected</h3>
            <p className="text-gray-600 text-sm">
              Subscribe to our newsletter for the latest opportunities and updates.
            </p>
            <div className="space-y-2">
              <div className="flex">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="rounded-r-none bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500"
                />
                <Button className="rounded-l-none bg-primary hover:bg-primary/90">Subscribe</Button>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>support@levelup.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">© 2024 LevelUP. All rights reserved.</div>

            <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-gray-900 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="text-gray-500 hover:text-gray-900 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
