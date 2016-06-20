using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IoTDPWebTable.Models
{
    public class SASSensorTable : TableEntity
    {
        public string deviceId { get; set; }
        public double accelx { get; set; }
        public double accely { get; set; }
        public double accelz { get; set; }
        public double temp { get; set; }
        public double Longitude { get; set; }
        public double Latitude { get; set; }
        public DateTime time { get; set; }
    }
}
