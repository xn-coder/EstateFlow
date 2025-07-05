
'use client';

export default function DashboardFooter() {
  return (
    <footer className="bg-card text-center p-4 border-t">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-2 md:gap-0">
        <span>Copyright © 2021-2025. Lak Services. All rights reserved.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Terms Of Use</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
