import { useMemo } from "react";

function sumBy(items, selector) {
  return items.reduce((total, item) => {
    const value = Number(selector(item));
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

function clampTonnage(value) {
  return Number(Math.max(value, 0).toFixed(2));
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function useInventoryFlow({
  bargeLoads = [],
  unloadingTrips = [],
  processingBatches = [],
  outboundShipments = [],
}) {
  return useMemo(() => {
    const totalPurchasedTonnage = sumBy(bargeLoads, (item) => item.total_tonnage);
    const totalUnloadedTonnage = sumBy(unloadingTrips, (item) => item.tonnage);
    const totalProcessingConsumption = sumBy(processingBatches, (item) => item.tonnage_consumed);
    const totalProcessedTonnage = sumBy(processingBatches, (item) => item.tonnage_produced);

    const totalOutboundTonnage = sumBy(
      outboundShipments.filter((shipment) => shipment.status !== "cancelled"),
      (item) => item.tonnage,
    );

    const scheduledOutboundTonnage = sumBy(
      outboundShipments.filter((shipment) => shipment.status === "scheduled"),
      (item) => item.tonnage,
    );

    const deliveredOutboundTonnage = sumBy(
      outboundShipments.filter((shipment) => shipment.status === "completed"),
      (item) => item.tonnage,
    );

    const inTransitTonnage = clampTonnage(totalPurchasedTonnage - totalUnloadedTonnage);
    const rawYardInventory = clampTonnage(totalUnloadedTonnage - totalProcessingConsumption);
    const finishedYardInventory = clampTonnage(totalProcessedTonnage - deliveredOutboundTonnage);

    const productBreakdown = [];
    const productMap = new Map();

    const ensureProduct = ({ id, name }) => {
      if (id == null) {
        return null;
      }

      if (!productMap.has(id)) {
        productMap.set(id, {
          product_id: id,
          product_name: name,
          rawPurchased: 0,
          rawAvailable: 0,
          finishedAvailable: 0,
          committed: 0,
        });
      }
      return productMap.get(id);
    };

    bargeLoads.forEach((barge) => {
      const productEntry = ensureProduct({ id: barge.product_id, name: barge.product_name });
      if (productEntry) {
        productEntry.rawPurchased += Number(barge.total_tonnage) || 0;
      }
    });

    unloadingTrips.forEach((trip) => {
      const productEntry = productMap.get(trip.product_id);
      if (productEntry) {
        productEntry.rawAvailable += Number(trip.tonnage) || 0;
      }
    });

    processingBatches.forEach((batch) => {
      const rawProduct = productMap.get(batch.raw_product_id);
      if (rawProduct) {
        rawProduct.rawAvailable -= Number(batch.tonnage_consumed) || 0;
      }

      const finishedProduct = ensureProduct({
        id: batch.finished_product_id,
        name: batch.finished_product_name,
      });
      if (finishedProduct) {
        finishedProduct.finishedAvailable += Number(batch.tonnage_produced) || 0;
      }
    });

    const outboundStatusLabels = {
      scheduled: "Agendado",
      completed: "Concluído",
      in_transit: "Em trânsito",
      cancelled: "Cancelado",
    };

    outboundShipments.forEach((shipment) => {
      const productEntry = ensureProduct({ id: shipment.product_id, name: shipment.product_name });
      if (!productEntry) {
        return;
      }

      if (shipment.status === "completed") {
        productEntry.finishedAvailable -= Number(shipment.tonnage) || 0;
      } else if (shipment.status === "scheduled") {
        productEntry.committed += Number(shipment.tonnage) || 0;
      }
    });

    productMap.forEach((value) => {
      const rawAvailable = clampTonnage(value.rawAvailable);
      const rawPurchased = clampTonnage(value.rawPurchased);
      const finishedAvailable = clampTonnage(value.finishedAvailable);
      const committed = clampTonnage(value.committed);
      const netFinished = clampTonnage(finishedAvailable - committed);
      productBreakdown.push({
        ...value,
        rawAvailable,
        rawPurchased,
        finishedAvailable,
        committed,
        netFinishedAvailable: netFinished,
      });
    });

    productBreakdown.sort((a, b) => a.product_name.localeCompare(b.product_name));

    const timelineEvents = [];

    bargeLoads.forEach((barge) => {
      const date = normalizeDate(barge.purchase_date);
      timelineEvents.push({
        type: "purchase",
        date,
        label: `Compra ${barge.barge_code}`,
        description: `${barge.total_tonnage} t de ${barge.product_name} do fornecedor ${barge.supplier}`,
      });
    });

    unloadingTrips.forEach((trip) => {
      const date = normalizeDate(trip.arrival_date);
      timelineEvents.push({
        type: "unload",
        date,
        label: `Descarga #${trip.sequence}`,
        description: `${trip.tonnage} t descarregadas para ${trip.destination}`,
      });
    });

    processingBatches.forEach((batch) => {
      const date = normalizeDate(batch.start_date);
      timelineEvents.push({
        type: "processing",
        date,
        label: `Processamento ${batch.batch_code}`,
        description: `${batch.tonnage_consumed} t convertidas em ${batch.tonnage_produced} t de ${batch.finished_product_name}`,
      });
    });

    outboundShipments.forEach((shipment) => {
      const date = normalizeDate(shipment.shipping_date);
      const statusLabel = outboundStatusLabels[shipment.status] || shipment.status || "Status desconhecido";
      timelineEvents.push({
        type: "outbound",
        date,
        label: `Saída ${shipment.order_code}`,
        description: `${shipment.tonnage} t enviadas para ${shipment.customer_name} (${statusLabel})`,
      });
    });

    timelineEvents.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.getTime() - a.date.getTime();
    });

    return {
      metrics: {
        totalPurchasedTonnage: clampTonnage(totalPurchasedTonnage),
        totalUnloadedTonnage: clampTonnage(totalUnloadedTonnage),
        inTransitTonnage,
        rawYardInventory,
        finishedYardInventory,
        totalOutboundTonnage: clampTonnage(totalOutboundTonnage),
        scheduledOutboundTonnage: clampTonnage(scheduledOutboundTonnage),
        deliveredOutboundTonnage: clampTonnage(deliveredOutboundTonnage),
      },
      productBreakdown,
      timelineEvents,
    };
  }, [bargeLoads, outboundShipments, processingBatches, unloadingTrips]);
}

export default useInventoryFlow;
