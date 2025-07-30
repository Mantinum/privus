import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

export default function PluginPage({ params }: any) {
  const { slug } = params as { slug: string };
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Component = dynamic(() => import(`../../../../plugins/${slug}/ui/page`));
    return <Component />;
  } catch {
    notFound();
  }
  return null;
}
