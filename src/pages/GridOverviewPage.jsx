import { useQuery } from '@tanstack/react-query';
import { getGrid, getTransformer } from '../services/api/transformerApi';
import { GridMap } from '../components/grid/GridMap';
import { DigitalTwinPanel } from '../components/twin/DigitalTwinPanel';
import { SectionHeader } from '../components/common/SectionHeader';
import { ErrorBlock, LoadingBlock } from '../components/common/StateBlock';
import { useGridStore } from '../store/gridStore';

export default function GridOverviewPage() {
  const selectedId = useGridStore((state) => state.selectedTransformerId);
  const setSelectedTransformerId = useGridStore((state) => state.setSelectedTransformerId);
  const { data: grid, isLoading, error } = useQuery({ queryKey: ['grid'], queryFn: getGrid });
  const { data: transformer } = useQuery({
    queryKey: ['transformer', selectedId],
    queryFn: () => getTransformer(selectedId),
    enabled: Boolean(selectedId),
  });

  if (isLoading) return <LoadingBlock label="Loading grid map" />;
  if (error) return <ErrorBlock />;

  return (
    <div>
      <SectionHeader eyebrow="City Map" title="Grid Overview" />
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <LayerCard label="Grid Health Layer" value={`${Math.round(grid.transformers.reduce((sum, item) => sum + item.healthScore, 0) / grid.transformers.length)}%`} />
        <LayerCard label="Power Flow Direction" value="North -> South-East" />
        <LayerCard label="Active Alerts" value={grid.transformers.filter((item) => item.status !== 'NORMAL').length} />
        <LayerCard label="Critical Zones" value={grid.transformers.filter((item) => item.status === 'CRITICAL').map((item) => item.location).join(', ') || 'None'} />
      </div>
      <div className="space-y-5">
        <div className="h-[58vh] min-h-[520px] rounded border border-grid-line bg-grid-panel p-3 shadow-panel">
          <GridMap
            transformers={grid.transformers}
            gridLines={grid.gridLines}
            selectedId={selectedId}
            onSelect={setSelectedTransformerId}
          />
        </div>
        {transformer ? (
          <div className="w-full">
            <DigitalTwinPanel transformer={transformer} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LayerCard({ label, value }) {
  return (
    <div className="rounded border border-grid-line bg-grid-panel p-3 shadow-panel">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
