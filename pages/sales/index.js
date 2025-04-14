import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import DeleteIcon from '@mui/icons-material/Delete';


export default function SalesList() {
  const [sales, setSales] = useState([]);
  const [sum, setSum] = useState(0);
  const [user, setUser] = useState(null);
  const [startDate, setStartDate] = useState(""); // Start date for filter
  const [endDate, setEndDate] = useState(""); // End date for filter
  const [selectedSale, setSelectedSale] = useState(null); // Track selected sale for modal
  const [openModal, setOpenModal] = useState(false); // Track modal open state
  const [allTotal, setAllTotal] = useState(0);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get(`${process.env.server}/sale`);
        setSales(response.data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };

    fetchSales();
  }, []);

  const formatDate = (date) => {
    const formattedDate = new Date(date).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour format
    });
    return formattedDate;
  };

  const calculateTotal = (all) => {
    let total = 0;
    all.forEach((element) => {
      if (element) {
        total += element;
      }
    });
    return total;
  };

  const calculateEach = (order) => {
    let total = 0;
    total += order.case?.price ? order.case?.price : 0 * order.quantity;
    total += order.material?.price ? order.material?.price : 0 * order.weight;
    total += order.item?.price ? order.item?.price : 0 * order.length;
    total += order.service?.price ? order.service?.price : 0;
    return total;
  };

  const calculateAll = (sales) => {
    let total = 0;
    sales.forEach((order) => {
      total += order.case?.price ? order.case?.price : 0 * order.quantity;
      total += order.material?.price ? order.material?.price : 0 * order.weight;
      total += order.item?.price ? order.item?.price : 0 * order.length;
      total += order.service?.price ? order.service?.price : 0;
    });
    return total;
  };

  // Filter sales by date range
  const filteredSales = sales.filter((sale) => {
    let saleDate = new Date(sale.createdAt);
    saleDate = sale.updatedAt && new Date(sale.updatedAt)
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && saleDate < start) return false;
    if (end && saleDate > end) return false;
    return true;
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUser(user);
    }
  }, []);  

  useEffect(() => {
    const newSum = filteredSales.reduce((total, sale) => {
      return total + calculateTotal([sale.received]);
    }, 0);
    setSum(newSum);
  }, [filteredSales]);

  const handleRowClick = (sale) => {
    setSelectedSale(sale);
    setOpenModal(true);
  };

  const onDelete = async (_id) => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await axios.delete(
        `${process.env.server}/sale`,
        { 
            params: {
            _id: _id,
          }, 
        },
        {
          headers: {
            authorization: "Bearer " + user.token,
          },
        }
      );

      if (response) {
        // setLoading(false);
        // setSelectedOrders([]);
        // router.push("/sales");
      }
    } catch (error) {
      console.error("Error sending orders:", error);
      // setLoading(false);
    }
  };


  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSale(null);
  };

  const calculateOrdersTotal = (orders) => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  return (
    <Box
      display="flex"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{ position: "absolute", width: "100%", top: 0, height: "100vh" }}
    >
      <Box
        flex={8}
        bgcolor="white"
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={4}
        height="100vh"
      >
        <Typography variant="h4" gutterBottom>
          Сатылымдар тізімі
        </Typography>

        <TableContainer component={Paper} sx={{ maxWidth: "90%" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Клиент</strong>
                </TableCell>
                <TableCell>
                  <strong>Сатылған күн</strong>
                </TableCell>
                <TableCell>
                  <strong>Баға</strong>
                </TableCell>
                <TableCell>
                  <strong>Қабылданған сумма</strong>
                </TableCell>
                <TableCell>
                  <strong>Соңғы қабылданған сумма</strong>
                </TableCell>
                <TableCell>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell onClick={() => handleRowClick(sale)}>{sale.name}</TableCell>
                    <TableCell onClick={() => handleRowClick(sale)}>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell onClick={() => handleRowClick(sale)}>{sale.total}₸</TableCell>
                    <TableCell onClick={() => handleRowClick(sale)}>{sale.received ? sale.received : 0}₸</TableCell>
                    <TableCell style={{ color : "green" }}>{sale.last_received ? sale.last_received : "0"}₸</TableCell>
                    {user.role === "admin" && <TableCell><DeleteIcon onClick={(e) => onDelete(sale._id)} style={{cursor: "pointer", color: "red"}}/></TableCell>}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Сатылымдар жоқ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box
        sx={{
          position: "absolute",
          display: "flex",
          justifyContent: "space-between",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "white",
          padding: 2,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Сатылым суммасы: {sum}₸
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <TextField
            label="Басталуы"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Аяқталуы"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <Button
            variant="contained"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
          >
            Өшіру
          </Button>
        </Box>
      </Box>

      {/* Modal for Sale Details */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Сатылым туралы мәліметтер</DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Card sx={{}}>
              <CardContent>
                <Box>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Клиент: {selectedSale.name}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      Тапсырыс күні: {formatDate(selectedSale.createdAt)}
                    </Typography>
                  </div>
                  {selectedSale.sales.length === 0 ? (
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
                        <TableBody>
                          {selectedSale.sales.map((order, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                {order.item?.name
                                  ? `${order.item?.name} (${order.item?.price}₸ * ${order.length}м)`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {order.service?.name || "-"}
                              </TableCell>
                              <TableCell>
                                {order.material?.name
                                  ? `${order.material?.name} (${order.material?.price}₸ * ${order.weight}кг)`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                {order.case?.name
                                  ? `${order.case?.name} (${order.case?.price}₸ * ${order.quantity}ш)`
                                  : "-"}
                              </TableCell>
                              <TableCell>{calculateEach(order)}₸</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Typography variant="h6" sx={{ m: 2 }}>
                        Жиынтық баға: {calculateAll(selectedSale.sales)}₸
                      </Typography>
                    </TableContainer>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <Button variant="contained" color="success">
            Басып шығару
          </Button>
          <Button
            variant="contained"
            onClick={handleCloseModal}
            color="primary"
          >
            Жабу
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export const getStaticProps = async () => {
  try {
    const response = await axios.get(`${process.env.server}/sale`);
    return {
      props: { sales: response.data || [] },
      revalidate: 10,
    };
  } catch (err) {
    return {
      notFound: true,
    };
  }
};
