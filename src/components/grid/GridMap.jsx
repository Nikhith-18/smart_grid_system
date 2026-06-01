import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet';
import { statusColor } from '../../utils/status';
import { StatusBadge } from '../common/StatusBadge';

const center = [12.292, 76.67];

const makeIcon = (status, selected) =>
  L.divIcon({
    className: '',
    html: `<div class="status-marker ${status === 'CRITICAL' ? 'critical' : ''}" style="width:${selected ? 22 : 17}px;height:${selected ? 22 : 17}px;background:${statusColor[status]};box-shadow:0 0 0 5px ${statusColor[status]}33,0 0 26px ${statusColor[status]}"></div>`,
    iconSize: [selected ? 22 : 17, selected ? 22 : 17],
    iconAnchor: [selected ? 11 : 8, selected ? 11 : 8],
  });

export function GridMap({ transformers, gridLines = [], selectedId, onSelect, compact = false }) {
  const byId = Object.fromEntries(transformers.map((item) => [item.id, item]));

  return (
    <MapContainer center={center} zoom={compact ? 12 : 13} scrollWheelZoom={!compact}>
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {gridLines.map(([from, to]) => {
        const a = byId[from];
        const b = byId[to];
        if (!a || !b) return null;
        return (
          <Polyline
            key={`${from}-${to}`}
            positions={[[a.latitude, a.longitude], [b.latitude, b.longitude]]}
            pathOptions={{ color: b.status === 'CRITICAL' || a.status === 'CRITICAL' ? '#fb7185' : '#39d5ff', opacity: 0.62, weight: 3, dashArray: '8 10' }}
          />
        );
      })}
      {transformers.map((transformer) => (
        <Marker
          key={transformer.id}
          position={[transformer.latitude, transformer.longitude]}
          icon={makeIcon(transformer.status, transformer.id === selectedId)}
          eventHandlers={{ click: () => onSelect?.(transformer.id) }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
            {transformer.id} - {transformer.location}
          </Tooltip>
          <Popup>
            <div className="min-w-40">
              <div className="mb-2 flex items-center justify-between gap-2">
                <strong>{transformer.name}</strong>
                <StatusBadge status={transformer.status} />
              </div>
              <div>Health: {transformer.healthScore}%</div>
              <div>Load: {transformer.loadPercentage}%</div>
              <div>Active Alerts: {transformer.status === 'CRITICAL' ? '2' : transformer.status === 'WARNING' ? '1' : '0'}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      {transformers.map((transformer) => (
        <CircleMarker
          key={`${transformer.id}-halo`}
          center={[transformer.latitude, transformer.longitude]}
          radius={compact ? 18 : 28}
          pathOptions={{
            color: statusColor[transformer.status],
            fillColor: statusColor[transformer.status],
            fillOpacity: transformer.id === selectedId ? 0.14 : 0.05,
            opacity: transformer.status === 'CRITICAL' ? 0.95 : transformer.id === selectedId ? 0.8 : 0.25,
            weight: transformer.status === 'CRITICAL' ? 3 : 1,
          }}
        />
      ))}
    </MapContainer>
  );
}
