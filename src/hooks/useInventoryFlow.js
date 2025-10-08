import { useMemo } from "react";

function sumBy(items, selector) {
  return items.reduce((total, item) => total + (selector(item) || 0), 0);
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

    const inTransitTonnage = Math.max(totalPurchasedTonnage - totalUnloadedTonnage, 0);
    const rawYardInventory = Math.max(totalUnloadedTonnage - totalProcessingConsumption, 0);
    const finishedYardInventory = Math.max(totalProcessedTonnage - deliveredOutboundTonnage, 0);

    const productBreakdown = [];
    const productMap = new Map();

    bargeLoads.forEach((barge) => {
      if (!productMap.has(barge.product_id)) {
        productMap.set(barge.product_id, {
          product_id: barge.product_id,
          product_name: barge.product_name,
          rawPurchased: 0,
          rawAvailable: 0,
          finishedAvailable: 0,
          committed: 0,
        });
      }
      const productEntry = productMap.get(barge.product_id);
      productEntry.rawPurchased += barge.total_tonnage || 0;
    });

    unloadingTrips.forEach((trip) => {
      const productEntry = productMap.get(trip.product_id);
      if (productEntry) {
        productEntry.rawAvailable += trip.tonnage || 0;
      }
    });

    processingBatches.forEach((batch) => {
      const rawProduct = productMap.get(batch.raw_product_id);
      if (rawProduct) {
        rawProduct.rawAvailable -= batch.tonnage_consumed || 0;
      }

      if (!productMap.has(batch.finished_product_id)) {
        productMap.set(batch.finished_product_id, {
          product_id: batch.finished_product_id,
          product_name: batch.finished_product_name,
          rawPurchased: 0,
          rawAvailable: 0,
          finishedAvailable: 0,
          committed: 0,
        });
      }

      const finishedProduct = productMap.get(batch.finished_product_id);
      finishedProduct.finishedAvailable += batch.tonnage_produced || 0;
    });

    outboundShipments.forEach((shipment) => {
      if (!productMap.has(shipment.product_id)) {
        productMap.set(shipment.product_id, {
          product_id: shipment.product_id,
          product_name: shipment.product_name,
          rawPurchased: 0,
          rawAvailable: 0,
          finishedAvailable: 0,
          committed: 0,
        });
      }

      const productEntry = productMap.get(shipment.product_id);
      if (shipment.status === "completed") {
        productEntry.finishedAvailable -= shipment.tonnage || 0;
      } else if (shipment.status === "scheduled") {
        productEntry.committed += shipment.tonnage || 0;
      }
    });

    productMap.forEach((value) => {
      productBreakdown.push({
        ...value,
        rawAvailable: Number(value.rawAvailable.toFixed(2)),
        rawPurchased: Number(value.rawPurchased.toFixed(2)),
        finishedAvailable: Number(value.finishedAvailable.toFixed(2)),
        committed: Number(value.committed.toFixed(2)),
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
      timelineEvents.push({
        type: "outbound",
        date,
        label: `Saída ${shipment.order_code}`,
        description: `${shipment.tonnage} t enviadas para ${shipment.customer_name}`,
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
        totalPurchasedTonnage: Number(totalPurchasedTonnage.toFixed(2)),
        totalUnloadedTonnage: Number(totalUnloadedTonnage.toFixed(2)),
        inTransitTonnage: Number(inTransitTonnage.toFixed(2)),
        rawYardInventory: Number(rawYardInventory.toFixed(2)),
        finishedYardInventory: Number(finishedYardInventory.toFixed(2)),
        totalOutboundTonnage: Number(totalOutboundTonnage.toFixed(2)),
        scheduledOutboundTonnage: Number(scheduledOutboundTonnage.toFixed(2)),
        deliveredOutboundTonnage: Number(deliveredOutboundTonnage.toFixed(2)),
      },
      productBreakdown,
      timelineEvents,
    };
  }, [bargeLoads, outboundShipments, processingBatches, unloadingTrips]);
}

export default useInventoryFlow;
