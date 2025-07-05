
'use client';

export default function DashboardFooter() {
  return (
    <footer className="bg-card text-center p-4 border-t">
      <div className="container mx-auto flex justify-between items-center text-sm text-gray-500">
        <span>Copyright © 2021-2025. Lak Services. All rights reserved.</span>
        <div>
          <a href="#" className="mr-4 hover:underline">Terms Of Use</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
