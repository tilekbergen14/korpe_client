import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  MenuItem,
  Select,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";
import { TextField } from "@mui/material";

export default function CalculatorPage(props) {
  const [items, setItems] = useState(props.items || []);
  const [services, setServices] = useState(props.services || []);
  const [materials, setMaterials] = useState(props.materials || []);
  const [cases, setCases] = useState(props.cases || []);
  const [loading, setLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const [length, setLenght] = useState(1);
  const [weight, setWeight] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const [total, setTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [client, setClient] = useState("");
  const [price, setPrice] = useState("");
  const [received, setReceived] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]); // Stores selected orders
  const [canSend, setCanSend] = useState(false);

  const router = useRouter();
  const today = new Date();

  useEffect(() => {
    const totalPrice =
      (selectedItem?.price || 0) * length +
      (selectedService?.price || 0) +
      (selectedMaterial?.price || 0) * weight +
      (selectedCase?.price || 0) * quantity;

    setTotal(totalPrice);
  }, [
    selectedItem,
    selectedService,
    selectedMaterial,
    selectedCase,
    length,
    weight,
    quantity,
  ]);

  const addToOrders = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await axios.post(
        `${process.env.server}/pillow`,
        {
          length,
          weight,
          quantity,
          name: client,
          price,
        },
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );

      if (response) {
        setLoading(false);
        // setSelectedOrders([]);
        // router.push("/sales");
      }
    } catch (error) {
      console.error("Error sending orders:", error);
      setLoading(false);
    }
  };

  const removeOrder = (index) => {
    const updatedOrders = selectedOrders.filter((_, i) => i !== index);
    setSelectedOrders(updatedOrders);
  };

  const sendOrdersToBackend = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await axios.post(
        `${process.env.server}/sale`,
        { orders: selectedOrders, client, total: allTotal, received },
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );

      if (response) {
        setLoading(false);
        // setSelectedOrders([]);
        // router.push("/sales");
      }
    } catch (error) {
      console.error("Error sending orders:", error);
      setLoading(false);
    }
  };

  return (
    <Box display="flex" p={4} justifyContent={"center"}>
      {loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="100vh"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            opacity: 0.5,
            backgroundColor: "black",
            zIndex: 999,
          }}
        >
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Деректер жүктелуде...
          </Typography>
        </Box>
      )}

      {/* Dropdown Selectors */}
      <div style={{ width: "60%" }}>
        <div className="flex">
          <TextField
            type="text"
            label="Метр"
            variant="outlined"
            value={length}
            sx={{ mt: 5, width: "100%" }}
            onChange={(e) => setLenght(e.target.value)}
          />
        </div>
        <div className="flex">
          <TextField
            type="number"
            label="Кг"
            variant="outlined"
            value={weight}
            sx={{ mt: 5, width: "100%" }}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="flex">
          <TextField
            type="number"
            label="Штук"
            variant="outlined"
            value={quantity}
            sx={{ mt: 5, width: "100%" }}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
          />
        </div>
        <div className="flex">
          <TextField
            label="Атауы"
            fullWidth
            variant="outlined"
            value={client}
            sx={{ mt: 5 }}
            onChange={(e) => {
              e.target.value !== "" && price !== ""
                ? setCanSend(true)
                : setCanSend(false);
              setClient(e.target.value);
            }}
          />
        </div>
        <div className="flex">
          <TextField
            label="Баға"
            fullWidth
            variant="outlined"
            value={price}
            sx={{ mt: 5 }}
            onChange={(e) => {
              e.target.value !== "" && client !== ""
                ? setCanSend(true)
                : setCanSend(false);
              setPrice(e.target.value);
            }}
          />
        </div>
        <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={addToOrders}
            sx={{ mt: 2, width: "100%" }}
            disabled={!canSend}
          >
            Жаңа қосу
          </Button>
        </Box>
      </div>
    </Box>
  );
}

// Dropdown Component
const Dropdown = ({ title, data, selected, setSelected }) => (
  <Box mb={3} width={"100%"}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Select
      fullWidth
      value={selected || ""}
      onChange={(e) => setSelected(e.target.value)}
      displayEmpty
    >
      <MenuItem value="">Таңдаңыз</MenuItem>
      {data.map((item) => (
        <MenuItem key={item._id} value={item}>
          {item.name} - {item.price}₸
        </MenuItem>
      ))}
    </Select>
  </Box>
);

export const getStaticProps = async () => {
  try {
    const items = await axios.get(`${process.env.server}/item`);
    const services = await axios.get(`${process.env.server}/service`);
    const materials = await axios.get(`${process.env.server}/material`);
    const cases = await axios.get(`${process.env.server}/case`);

    return {
      props: {
        items: items.data || [],
        services: services.data || [],
        materials: materials.data || [],
        cases: cases.data || [],
      },
      revalidate: 10,
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
