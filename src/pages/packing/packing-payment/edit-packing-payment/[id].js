import EditPackingPayment from "@/component/packing/packing-payment/EditPackingPayment";
import Sidebar from "@/component/sidebar/Sidebar";

const PackingPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <EditPackingPayment />
    </div>
  );
};

export default PackingPage;
