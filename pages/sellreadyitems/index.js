import { useState, useEffect } from "react";
import {
  Typography,
  Box,
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
  CircularProgress,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useRouter } from "next/router";

export default function CalculatorPage(props) {
  const [pillowItems, setPillowItems] = useState(props.pillowItems || []);
  const [loading, setLoading] = useState(false);
  const [selectedPillows, setSelectedPillows] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [client, setClient] = useState("");
  const [received, setReceived] = useState(0);
  const [selectedOrders, setSelectedOrders] = useState([]); // Stores selected orders
  const [canSend, setCanSend] = useState(false);

  const router = useRouter();
  const today = new Date();

  // Update total calculation whenever the quantity or selected pillow changes
  useEffect(() => {
    const totalPrice = selectedPillows.reduce(
      (acc, pillow) => acc + pillow.price * quantity,
      0
    );
    setTotal(totalPrice);
  }, [selectedPillows, quantity]);

  const addToOrders = () => {
    if (selectedPillows.length === 0) return;

    const newOrder = {
      pillows: selectedPillows,
      quantity,
      total,
    };

    setAllTotal(allTotal + total);
    setSelectedOrders([...selectedOrders, newOrder]);

    // Reset selections
    setSelectedPillows([]);
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

  const handlePillowClick = (pillow) => {
    console.log(pillow);
    setSelectedPillows((prev) => [...prev, pillow]);
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

      {/* Left Side: List of Pillows */}
      <div style={{ width: "40%" }}>
        <Typography variant="h6">Дайын тауарлар</Typography>
        <Box mt={2}>
          {pillowItems.map((item) => (
            <Button
              key={item._id}
              onClick={() => handlePillowClick(item)}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
            >
              {item.name} - {item.price}₸
            </Button>
          ))}
        </Box>
      </div>

      {/* Right Side: Order Summary */}
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

            {selectedPillows.length === 0 ? (
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
                        <strong>Жалпы баға</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  {selectedPillows.map((pillow, index) => (
                    <TableBody key={index}>
                      <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{pillow.name}</TableCell>
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                  }}
                >
                  <Typography variant="h6" sx={{ m: 2 }}>
                    Жиынтық баға: {allTotal}₸
                  </Typography>
                  <TextField
                    label="Қабылданған сумма"
                    variant="outlined"
                    value={received}
                    onChange={(e) => {
                      e.target.value !== "" &&
                      client !== "" &&
                      allTotal >= e.target.value
                        ? setCanSend(true)
                        : setCanSend(false);
                      setReceived(e.target.value);
                    }}
                  />
                </div>
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

// Fetch Pillow items from backend
export const getStaticProps = async () => {
  try {
    const response = await axios.get(`${process.env.server}/pillow`);
    return {
      props: {
        pillowItems: response.data || [],
      },
      revalidate: 10,
    };
  } catch (err) {
    console.error("Error fetching pillow items:", err);
    return {
      notFound: true,
    };
  }
};
