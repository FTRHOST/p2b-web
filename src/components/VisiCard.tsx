import { Icon } from '@iconify/react';
import { CardCornerPattern } from './CardCornerPattern';
import { SiteSettings } from '../types/cms';
import { HomeVisiBlockConfig } from '../data/homeBuilderDefaults';
import { ScrollWordTitle } from './ScrollWordTitle';

interface VisiCardProps {
  settings?: SiteSettings;
  blockConfig?: Partial<HomeVisiBlockConfig>;
}

const VISI_ICON_MAP: Record<NonNullable<HomeVisiBlockConfig['icon']>, string> = {
  compass: 'mdi:compass-outline',
  target: 'mdi:target',
  shield: 'mdi:shield-check-outline',
  layers: 'mdi:layers-outline',
};

export function VisiCard({ settings, blockConfig }: VisiCardProps) {
  const iconName =
    (blockConfig?.icon && VISI_ICON_MAP[blockConfig.icon]) ||
    'mdi:compass-outline';

  return (
    <section className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#0F3126] via-[#164234] to-[#1D5442] border border-[#C9A45A]/35 p-7 sm:p-10 md:p-14 text-[#FAF8F3] flex flex-col gap-5">
      <CardCornerPattern
        index={3}
        position="top-right"
        sizeClassName="w-52 h-52 sm:w-64 sm:h-64"
        opacityClassName="opacity-[0.14] group-hover:opacity-[0.22]"
      />
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#F4D993]/15 border border-[#F4D993]/40 flex items-center justify-center shrink-0">
          <Icon icon={iconName} className="w-5 h-5 text-[#F4D993]" />
        </div>
        <span className="text-xs md:text-sm uppercase tracking-[0.16em] text-[#F4D993]">
          {blockConfig?.label?.trim() ||
            settings?.page_visimisi_visi_label?.trim() ||
            'Visi P2B'}
        </span>
      </div>

      <ScrollWordTitle
        as="h2"
        text={
          blockConfig?.text?.trim() ||
          settings?.page_visimisi_visi_text?.trim() ||
          'Menjadi pusat pengembangan bisnis universitas yang profesional, inovatif, dan berkelanjutan dalam mendukung kemandirian serta peningkatan nilai tambah kelembagaan UIN Salatiga.'
        }
        duration={0.58}
        className="relative z-10 text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-tight leading-[1.2] max-w-5xl text-balance"
      />

      <p className="relative z-10 text-sm sm:text-base text-[#F6F3EC]/85 max-w-3xl leading-relaxed">
        {blockConfig?.subtext?.trim() ||
          settings?.page_visimisi_visi_subtext?.trim() ||
          'Sebagai bagian dari ekosistem entrepreneurial university PTN BLU, P2B menyelaraskan pertumbuhan pendapatan universitas dengan peningkatan kualitas layanan publik serta pengembangan kompetensi generasi muda.'}
      </p>
    </section>
  );
}
