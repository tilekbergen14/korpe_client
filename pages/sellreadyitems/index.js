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
  const [total, setTotal] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [client, setClient] = useState("");
  const [received, setReceived] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [canSend, setCanSend] = useState(false);

  const router = useRouter();
  const today = new Date();

  useEffect(() => {
    const totalPrice = selectedPillows.reduce(
      (acc, item) => acc + item.pillow.price * item.quantity,
      0
    );
    setTotal(totalPrice);
  }, [selectedPillows]);

  const handlePillowClick = (pillow) => {
    setSelectedPillows((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.pillow._id === pillow._id
      );
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { pillow, quantity: 1 }];
      }
    });
  };

  const removeSelectedPillow = (index) => {
    const updated = [...selectedPillows];
    updated.splice(index, 1);
    setSelectedPillows(updated);
  };

  const addToOrders = () => {
    if (selectedPillows.length === 0) return;

    const newOrder = {
      pillows: selectedPillows,
      total,
    };

    setAllTotal(allTotal + total);
    setSelectedOrders([...selectedOrders, newOrder]);

    // Reset
    setSelectedPillows([]);
  };

  const sendOrdersToBackend = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await axios.post(
        `${process.env.server}/sale`,
        {
          orders: selectedPillows,
          client,
          total: total,
          received,
          readyOrder: true,
        },
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );

      if (response) {
        setLoading(false);
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
              style={{ textAlign: "start" }}
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div className="flex" style={{ alignItems: "center" }}>
                <Typography variant="h6" style={{ textAlign: "center" }}>
                  Клиент:
                </Typography>
                <TextField
                  value={client}
                  onChange={(e) => {
                    setClient(e.target.value);
                    setCanSend(
                      e.target.value !== "" &&
                        received !== "" &&
                        received <= total
                    );
                  }}
                  size="small"
                  placeholder="Клиент аты"
                  style={{ marginLeft: 16 }}
                />
              </div>
              <Typography variant="h6" gutterBottom>
                Тапсырыс күні: {today.toISOString().split("T")[0]}
              </Typography>
            </div>

            {selectedPillows.length === 0 ? (
              <Typography color="textSecondary">Себет бос.</Typography>
            ) : (
              <TableContainer component={Paper} style={{ padding: 16 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>№</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Маталар</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Саны</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Жалпы баға</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Әрекет</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPillows.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.pillow.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.pillow.price * item.quantity}₸
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removeSelectedPillow(index)}
                          >
                            Жою
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  mt={2}
                  alignItems="center"
                >
                  <Typography variant="h6">Жиынтық баға: {total}₸</Typography>
                  <TextField
                    label="Қабылданған сумма"
                    variant="outlined"
                    type="number"
                    value={received}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setReceived(value);
                      setCanSend(
                        value !== "" && client !== "" && value <= total
                      );
                    }}
                    sx={{ mt: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={sendOrdersToBackend}
                    disabled={!canSend}
                  >
                    Барлығын жіберу
                  </Button>
                </Box>
              </TableContainer>
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
