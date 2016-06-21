using Microsoft.Azure.Devices;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace SendCmdCloud2DeviceWpf
{
    /// <summary>
    /// MainWindow.xaml の相互作用ロジック
    /// </summary>
    public partial class MainWindow : Window
    {
        ServiceClient serviceClient;

        FlowDocument statusDoc = new FlowDocument();
        string defalutDeviceId = "";

        public MainWindow()
        {
            InitializeComponent();
            rtbStatus.Document = statusDoc;
            defalutDeviceId = tbDeviceId.Text;

            this.Loaded += MainWindow_Loaded;
        }

        private void MainWindow_Loaded(object sender, RoutedEventArgs e)
        {
            if (!string.IsNullOrEmpty(IoTHubRFHoL.IoTHubDefinition.IoTHubServiceConnectionString))
            {
                tbConnectionString.Text = IoTHubRFHoL.IoTHubDefinition.IoTHubServiceConnectionString;
            }
        }

        private async Task ReceiveFeedbackAsync()
        {
            var feedbackReceiver = serviceClient.GetFeedbackReceiver();

            Console.WriteLine("\nReceiving c2d feedback from service");
            while (true)
            {
                var feedbackBatch = await feedbackReceiver.ReceiveAsync();
                if (feedbackBatch == null) continue;

                WriteStatus(new Paragraph(new Run("Ack Received -" + feedbackBatch.EnqueuedTime.ToString())));

                await feedbackReceiver.CompleteAsync(feedbackBatch);
            }
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            if (defalutDeviceId == tbDeviceId.Text)
            {
                WriteStatus(new Paragraph(new Run("Please input 'Device Id'")));
                return;
            }
            await SendCloudToDeviceMessageAsync("fezhat:D2=" + ((Button)sender).Content);
        }

        private async Task SendCloudToDeviceMessageAsync(string command)
        {
            if (string.IsNullOrEmpty(command))
            {
                command = "Cloud to device message.";
            }
            var commandMessage = new Message(Encoding.ASCII.GetBytes(command));
            commandMessage.Ack = DeliveryAcknowledgement.Full;
            await serviceClient.SendAsync(tbDeviceId.Text, commandMessage);
            WriteStatus(new Paragraph(new Run("Send - '" + command + "' to '" + tbDeviceId.Text + "'")));
        }

        private void WriteStatus(Paragraph pg)
        {
            statusDoc.Blocks.Add(pg);
        }

        private void buttonConnect_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(tbConnectionString.Text))
            {
                WriteStatus(new Paragraph(new Run("Please input 'Connection String'")));
                return;
            }
            WriteStatus(new Paragraph(new Run("Connecting to IoT Hub...")));
            serviceClient = ServiceClient.CreateFromConnectionString(tbConnectionString.Text);
            WriteStatus(new Paragraph(new Run("Connected to IoT Hub.")));

            button0.IsEnabled = true;
            button1.IsEnabled = true;
            button2.IsEnabled = true;
            button3.IsEnabled = true;
            button4.IsEnabled = true;
            button5.IsEnabled = true;
            button6.IsEnabled = true;
            button7.IsEnabled = true;

            ReceiveFeedbackAsync();
        }
    }
}
