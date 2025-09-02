# ============================================================================
# 🏗️ Domain Layer - 도메인 레이어
# ============================================================================

from .datagather.input_data_entity import InputData
from .datagather.output_data_entity import OutputData
from .datagather.transport_data_entity import TransportData
from .datagather.process_data_entity import ProcessData
from .datagather.utility_data_entity import UtilityData
from .datagather.waste_data_entity import WasteData
from .datagather.fuel_data_entity import FuelData
from .datagather.process_product_data_entity import ProcessProductData

__all__ = [
    "InputData",
    "OutputData", 
    "TransportData",
    "ProcessData",
    "UtilityData",
    "WasteData",
    "FuelData",
    "ProcessProductData"
]
