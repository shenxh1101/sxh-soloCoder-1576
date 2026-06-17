import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import NewOrder from '@/pages/NewOrder';
import OrderDetail from '@/pages/OrderDetail';
import Statistics from '@/pages/Statistics';
import PriceSettings from '@/pages/PriceSettings';
import Members from '@/pages/Members';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="prices" element={<PriceSettings />} />
          <Route path="members" element={<Members />} />
        </Route>
      </Routes>
    </Router>
  );
}
