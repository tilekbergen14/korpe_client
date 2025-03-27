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

  const [lenght, setLenght] = useState(1);
  const [weight, setWeight] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const [total, setTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [client, setClient] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]); // Stores selected orders
  const [canSend, setCanSend] = useState(false);

  const router = useRouter();
  const today = new Date();

  useEffect(() => {
    const totalPrice =
      (selectedItem?.price || 0) * lenght +
      (selectedService?.price || 0) +
      (selectedMaterial?.price || 0) * weight +
      (selectedCase?.price || 0) * quantity;

    setTotal(totalPrice);
  }, [
    selectedItem,
    selectedService,
    selectedMaterial,
    selectedCase,
    lenght,
    weight,
    quantity,
  ]);

  const addToOrders = () => {
    if (!selectedItem && !selectedService && !selectedMaterial && !selectedCase)
      return;

    const newOrder = {
      item: selectedItem,
      service: selectedService,
      material: selectedMaterial,
      case: selectedCase,
      lenght,
      weight,
      quantity,
      total,
    };
    setAllTotal(allTotal + total);
    setSelectedOrders([...selectedOrders, newOrder]);

    // Reset selections
    setSelectedItem(null);
    setSelectedService(null);
    setSelectedMaterial(null);
    setSelectedCase(null);
    setLenght(1);
    setWeight(1);
    setQuantity(1);
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
        { orders: selectedOrders, client, total: allTotal },
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
    <Box display="flex" p={4}>
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
      <div style={{ width: "40%" }}>
        <div className="flex">
          <Dropdown
            title="Маталар"
            data={items}
            selected={selectedItem}
            setSelected={setSelectedItem}
          />
          <TextField
            type="number"
            label="Метр"
            variant="outlined"
            value={lenght}
            sx={{ mt: 5, ml: 1, width: 100 }}
            onChange={(e) =>
              setLenght(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
          />
        </div>
        <Dropdown
          title="Қызметтер"
          data={services}
          selected={selectedService}
          setSelected={setSelectedService}
        />
        <div className="flex">
          <Dropdown
            title="Шикізат"
            data={materials}
            selected={selectedMaterial}
            setSelected={setSelectedMaterial}
          />
          <TextField
            type="number"
            label="Кг"
            variant="outlined"
            value={weight}
            sx={{ mt: 5, ml: 1, width: 100 }}
            onChange={(e) =>
              setWeight(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
          />
        </div>
        <div className="flex">
          <Dropdown
            title="Қаптар"
            data={cases}
            selected={selectedCase}
            setSelected={setSelectedCase}
          />
          <TextField
            type="number"
            label="Штук"
            variant="outlined"
            value={quantity}
            sx={{ mt: 5, ml: 1, width: 100 }}
            onChange={(e) =>
              setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
            }
          />
        </div>
        <Box mt={4} display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h5">Жиынтық баға: {total}₸</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={addToOrders}
            sx={{ mt: 2, width: "100%" }}
          >
            Себетке қосу
          </Button>
        </Box>
        <div className="flex">
          <TextField
            label="Клиент"
            fullWidth
            variant="outlined"
            value={client}
            sx={{ mt: 5 }}
            onChange={(e) => {
              e.target.value !== "" ? setCanSend(true) : setCanSend(false);
              setClient(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Order Summary Card */}
      <Card sx={{ ml: 2, width: "60%" }}>
        <CardContent>
          <Box ml={4}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="h6" gutterBottom>
                Клиент: {client}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Тапсырыс күні: {today.toISOString().split("T")[0]}
              </Typography>
            </div>
            {selectedOrders.length === 0 ? (
              <Typography color="textSecondary">Себет бос.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>&#8470;</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Маталар</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Қызмет</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Шикізат</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Қаптар</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Жалпы баға</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  {selectedOrders.map((order, index) => (
                    <TableBody key={index}>
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {order.item?.name
                            ? order.item?.name +
                              "(" +
                              order.item?.price +
                              "₸ * " +
                              order.lenght +
                              "м)"
                            : "-"}
                        </TableCell>
                        <TableCell>{order.service?.name || "-"}</TableCell>
                        <TableCell>
                          {order.material?.name
                            ? order.material?.name +
                              "(" +
                              order.material?.price +
                              "₸ * " +
                              order.weight +
                              "кг)"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {order.case?.name
                            ? order.case?.name +
                              "(" +
                              order.case?.price +
                              "₸ * " +
                              order.quantity +
                              "ш)"
                            : "-"}
                        </TableCell>
                        <TableCell>{order.total}₸</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removeOrder(index)}
                          >
                            Жою
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ))}
                </Table>
                <Typography variant="h6" sx={{ m: 2 }}>
                  Жиынтық баға: {allTotal}₸
                </Typography>
              </TableContainer>
            )}
            {selectedOrders.length > 0 && (
              <Button
                variant="contained"
                color="success"
                onClick={sendOrdersToBackend}
                sx={{ mt: 2, width: "100%" }}
                disabled={!canSend}
              >
                Барлығын жіберу
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
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
