import SiteFooter from '@/components/main/site-footer';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
};

export default FrontLayout;
