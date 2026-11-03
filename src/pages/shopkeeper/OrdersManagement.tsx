import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  PhoneCall,
  XCircle,
  Truck,
  Building,
  RotateCw,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { Order, OrderStatus } from '../../types';

export const OrdersManagement: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const [orders, setOrders] = useState<Order[]>(storage.getOrders(shop.id));
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const update = () => setOrders(storage.getOrders(shop.id));
    const unsub = storage.subscribe(update);
    return () => unsub();
  }, [shop.id]);

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    storage.updateOrderStatus(orderId, newStatus);
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === 'active') {
      return order.status !== 'completed' && order.status !== 'rejected';
    }
    if (statusFilter === 'completed') {
      return order.status === 'completed';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Customer Orders & Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept requests, track preparation, and fulfill pickup or home delivery orders.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs self-start">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({orders.filter((o) => o.status !== 'completed' && o.status !== 'rejected').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({orders.filter((o) => o.status === 'completed').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">No Orders in this View</h3>
          <p className="text-xs text-slate-500 mt-1">
            Incoming customer requests will appear here with instant audio/visual alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isRequestSent = order.status === 'request_sent';
            const isAccepted = order.status === 'shop_accepted';
            const isPreparing = order.status === 'preparing';
            const isReady = order.status === 'ready';
            const isOutForDelivery = order.status === 'out_for_delivery';
            const isCompleted = order.status === 'completed';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition space-y-4 ${
                  isRequestSent
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : isCompleted
                    ? 'border-slate-200 opacity-80'
                    : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-slate-900 text-base">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-700'
                          : isOutForDelivery
                          ? 'bg-emerald-100 text-emerald-800'
                          : isReady
                          ? 'bg-teal-100 text-teal-800'
                          : isPreparing
                          ? 'bg-blue-100 text-blue-800'
                          : isAccepted
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      ● {order.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">• {order.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      {order.orderType === 'delivery' ? (
                        <>
                          <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivery</span>
                        </>
                      ) : (
                        <>
                          <Building className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Pickup</span>
                        </>
                      )}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      ₹{order.total}
                    </span>
                  </div>
                </div>

                {/* Items & Customer Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Items */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                    <span className="font-bold text-slate-700 block">Items to fulfill:</span>
                    <div className="space-y-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span className="font-medium">
                            • {it.productName} ({it.quantity} {it.unit || 'x'})
                          </span>
                          <span className="font-semibold text-slate-900">₹{it.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer details & Live Voice Update */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{order.customerName}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>{order.customerPhone}</span>
                        </a>
                      </div>
                      {order.deliveryAddress && (
                        <p className="text-slate-500 mt-1 text-[11px]">
                          📍 Address: {order.deliveryAddress}
                        </p>
                      )}
                      {order.statusNotes && (
                        <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px]">
                          <span className="font-bold block text-emerald-800 uppercase text-[9px]">24/7 AI Voice Note:</span>
                          "{order.statusNotes}"
                        </div>
                      )}
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400">
                      Timeline: <strong>{order.estimatedTime}</strong>
                    </div>
                  </div>
                </div>

                {/* Status Action Buttons Pipeline */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium text-[11px]">Voice / Manual Action:</span>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isRequestSent && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept & Start Packing</span>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1"
                      >
                        <span>Mark Packing</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition flex items-center gap-1"
                      >
                        <span>Mark Packed (Ready for Partner)</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Handed to Partner (Out for Delivery)</span>
                      </button>
                    )}

                    {isOutForDelivery && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confirm Delivered & Closed</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Order Fulfilled & Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

