import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapViewProps {
  schedule: any;
}

const MapView: React.FC<MapViewProps> = ({ schedule }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([31.2304, 121.4737], 8);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !schedule?.assignments) return;

    const map = mapInstanceRef.current;
    
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.removeLayer(layer);
      }
    });

    const inspectorColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    const inspectorMarkers = new Map<string, L.Marker[]>();
    const inspectorRoutes = new Map<string, L.Polyline>();

    schedule.assignments.forEach((assignment: any, index: number) => {
      const colorIndex = index % inspectorColors.length;
      const color = inspectorColors[colorIndex];
      
      const factoryMarker = L.marker([assignment.latitude, assignment.longitude], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      });
      
      factoryMarker.bindPopup(`
        <div>
          <strong>${assignment.factory_name}</strong><br/>
          验货员: ${assignment.inspector_name}<br/>
          日期: ${assignment.scheduled_date}<br/>
          任务类型: ${assignment.task_type}
        </div>
      `);
      
      factoryMarker.addTo(map);
      
      if (!inspectorMarkers.has(assignment.inspector_name)) {
        inspectorMarkers.set(assignment.inspector_name, []);
      }
      inspectorMarkers.get(assignment.inspector_name)!.push(factoryMarker);
      
      if (assignment.route && Array.isArray(assignment.route) && assignment.route.length > 1) {
        const routeCoordinates = assignment.route.map((r: any) => [r.latitude, r.longitude]);
        
        const polyline = L.polyline(routeCoordinates as L.LatLngExpression[], {
          color,
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 10'
        });
        
        polyline.addTo(map);
        inspectorRoutes.set(assignment.inspector_id, polyline);
      }
    });

    const bounds = L.latLngBounds();
    schedule.assignments.forEach((assignment: any) => {
      if (assignment.latitude && assignment.longitude) {
        bounds.extend([assignment.latitude, assignment.longitude]);
      }
    });
    
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [schedule]);

  return (
    <div>
      <div ref={mapRef} style={{ height: '500px', width: '100%' }} />
      <div style={{ marginTop: '10px' }}>
        <strong>图例：</strong>
        <span style={{ display: 'inline-block', width: '15px', height: '15px', backgroundColor: '#FF6B6B', borderRadius: '50%', margin: '0 5px' }}></span>
        <span>验货员 1</span>
        <span style={{ display: 'inline-block', width: '15px', height: '15px', backgroundColor: '#4ECDC4', borderRadius: '50%', margin: '0 5px' }}></span>
        <span>验货员 2</span>
        <span style={{ display: 'inline-block', width: '15px', height: '15px', backgroundColor: '#45B7D1', borderRadius: '50%', margin: '0 5px' }}></span>
        <span>验货员 3</span>
      </div>
    </div>
  );
};

export default MapView;
